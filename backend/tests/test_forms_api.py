from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import get_settings
from app.db.base import Base
from app.db.session import get_db
from app.main import app


def valid_form_create_payload(slug: str = "student-feedback") -> dict:
    return {
        "slug": slug,
        "schema": {
            "title": "Student Feedback",
            "description": "Course feedback survey",
            "fields": [
                {
                    "id": "email",
                    "type": "email",
                    "label": "Your email",
                    "required": True,
                },
                {
                    "id": "rating",
                    "type": "rating",
                    "label": "Rate this course",
                    "required": True,
                    "min": 1,
                    "max": 5,
                },
            ],
        },
    }


def valid_form_version_payload(title: str = "Student Feedback v2") -> dict:
    return {
        "schema": {
            "title": title,
            "description": "Updated course feedback survey",
            "fields": [
                {
                    "id": "email",
                    "type": "email",
                    "label": "Your email",
                    "required": True,
                },
                {
                    "id": "rating",
                    "type": "rating",
                    "label": "Rate this course",
                    "required": True,
                    "min": 1,
                    "max": 5,
                },
            ],
        }
    }


def clear_auth_cookies(client: TestClient) -> None:
    settings = get_settings()
    client.cookies.delete(settings.access_token_cookie_name)
    client.cookies.delete(settings.refresh_token_cookie_name)
    client.cookies.delete(settings.csrf_cookie_name)


def sync_csrf_header(client: TestClient) -> None:
    csrf_token = client.cookies.get(get_settings().csrf_cookie_name)
    if csrf_token is not None:
        client.headers.update({get_settings().csrf_header_name: csrf_token})


def csrf_header(client: TestClient) -> dict[str, str]:
    csrf_token = client.cookies.get(get_settings().csrf_cookie_name)
    return {get_settings().csrf_header_name: csrf_token or ""}


@pytest.fixture(autouse=True)
def test_client() -> Generator[TestClient, None, None]:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=engine,
    )
    Base.metadata.create_all(bind=engine)

    def override_get_db() -> Generator[Session, None, None]:
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    previous_provider = get_settings().ai_provider
    get_settings().ai_provider = "mock"
    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as client:
        response = client.post(
            "/auth/register",
            json={"email": "owner@example.com", "password": "secret123"},
        )
        token = response.json()["access_token"]
        client.headers.update({"Authorization": f"Bearer {token}"})
        sync_csrf_header(client)
        yield client

    get_settings().ai_provider = previous_provider
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)


def test_create_form_persists_form_and_initial_version(test_client: TestClient) -> None:
    response = test_client.post(
        "/forms",
        json=valid_form_create_payload(),
        headers=csrf_header(test_client),
    )

    assert response.status_code == 201
    data = response.json()
    assert data["slug"] == "student-feedback"
    assert data["latest_version"]["version_number"] == 1
    assert data["response_count"] == 0


def test_cookie_auth_requires_csrf_for_mutations(test_client: TestClient) -> None:
    test_client.headers.pop("Authorization")
    test_client.headers.pop("X-CSRF-Token", None)

    response = test_client.post("/forms", json=valid_form_create_payload())

    assert response.status_code == 403


def test_generate_form_returns_valid_schema_without_persisting(
    test_client: TestClient,
) -> None:
    response = test_client.post(
        "/forms/generate",
        json={"prompt": "Create a course feedback survey"},
        headers=csrf_header(test_client),
    )
    list_response = test_client.get("/forms")

    assert response.status_code == 200
    assert response.json()["schema"]["fields"]
    assert list_response.json() == []


def test_list_forms_filters_by_owner_and_archive_status(
    test_client: TestClient,
) -> None:
    first = test_client.post(
        "/forms",
        json=valid_form_create_payload("owned-active"),
        headers=csrf_header(test_client),
    ).json()
    archived = test_client.post(
        "/forms",
        json=valid_form_create_payload("owned-archived"),
        headers=csrf_header(test_client),
    ).json()
    test_client.patch(
        f"/forms/{archived['id']}/settings",
        json={"archived": True},
        headers=csrf_header(test_client),
    )

    other_auth = test_client.post(
        "/auth/register",
        json={"email": "other@example.com", "password": "secret123"},
    ).json()
    test_client.headers.update({"Authorization": f"Bearer {other_auth['access_token']}"})
    sync_csrf_header(test_client)
    test_client.post(
        "/forms",
        json=valid_form_create_payload("other-form"),
        headers=csrf_header(test_client),
    )

    owner_auth = test_client.post(
        "/auth/login",
        json={"email": "owner@example.com", "password": "secret123"},
    ).json()
    test_client.headers.update({"Authorization": f"Bearer {owner_auth['access_token']}"})
    sync_csrf_header(test_client)

    active = test_client.get("/forms").json()
    all_forms = test_client.get("/forms?include_archived=true").json()

    assert [form["id"] for form in active] == [first["id"]]
    assert {form["id"] for form in all_forms} == {first["id"], archived["id"]}


def test_create_form_rejects_duplicate_slug(test_client: TestClient) -> None:
    first = test_client.post(
        "/forms",
        json=valid_form_create_payload("duplicate"),
        headers=csrf_header(test_client),
    )
    second = test_client.post(
        "/forms",
        json=valid_form_create_payload("duplicate"),
        headers=csrf_header(test_client),
    )

    assert first.status_code == 201
    assert second.status_code == 409


def test_create_form_version_updates_current_schema_and_lists_versions(
    test_client: TestClient,
) -> None:
    form = test_client.post(
        "/forms",
        json=valid_form_create_payload(),
        headers=csrf_header(test_client),
    ).json()

    create_version = test_client.post(
        f"/forms/{form['id']}/versions",
        json=valid_form_version_payload(),
        headers=csrf_header(test_client),
    )
    detail = test_client.get(f"/forms/{form['id']}")
    versions = test_client.get(f"/forms/{form['id']}/versions")

    assert create_version.status_code == 201
    assert create_version.json()["latest_version"]["version_number"] == 2
    assert detail.json()["latest_version"]["schema"]["title"] == "Student Feedback v2"
    assert [version["version_number"] for version in versions.json()] == [1, 2]


def test_update_form_settings_controls_public_access_and_archive_state(
    test_client: TestClient,
) -> None:
    form = test_client.post(
        "/forms",
        json=valid_form_create_payload(),
        headers=csrf_header(test_client),
    ).json()

    settings = test_client.patch(
        f"/forms/{form['id']}/settings",
        json={"accepting_responses": False, "requires_login": True},
        headers=csrf_header(test_client),
    )
    clear_auth_cookies(test_client)
    test_client.headers.pop("Authorization")
    test_client.headers.pop("X-CSRF-Token", None)
    public_detail = test_client.get(f"/forms/slug/{form['slug']}")
    closed_submit = test_client.post(
        f"/forms/{form['id']}/responses",
        json={"answers": {"email": "a@example.com", "rating": 5}},
    )

    owner_auth = test_client.post(
        "/auth/login",
        json={"email": "owner@example.com", "password": "secret123"},
    ).json()
    test_client.headers.update({"Authorization": f"Bearer {owner_auth['access_token']}"})
    sync_csrf_header(test_client)
    reopened = test_client.patch(
        f"/forms/{form['id']}/settings",
        json={"accepting_responses": True},
        headers=csrf_header(test_client),
    )
    clear_auth_cookies(test_client)
    test_client.headers.pop("Authorization")
    test_client.headers.pop("X-CSRF-Token", None)
    login_required_submit = test_client.post(
        f"/forms/{form['id']}/responses",
        json={"answers": {"email": "a@example.com", "rating": 5}},
    )

    owner_auth = test_client.post(
        "/auth/login",
        json={"email": "owner@example.com", "password": "secret123"},
    ).json()
    test_client.headers.update({"Authorization": f"Bearer {owner_auth['access_token']}"})
    sync_csrf_header(test_client)
    archive = test_client.patch(
        f"/forms/{form['id']}/settings",
        json={"archived": True},
        headers=csrf_header(test_client),
    )

    assert settings.status_code == 200
    assert public_detail.status_code == 200
    assert public_detail.json()["requires_login"] is True
    assert public_detail.json()["accepting_responses"] is False
    assert closed_submit.status_code == 409
    assert reopened.status_code == 200
    assert login_required_submit.status_code == 401
    assert archive.status_code == 200
    assert test_client.get(f"/forms/slug/{form['slug']}").status_code == 404


def test_submit_form_response_persists_answers_and_updates_count(
    test_client: TestClient,
) -> None:
    form = test_client.post(
        "/forms",
        json=valid_form_create_payload(),
        headers=csrf_header(test_client),
    ).json()

    response = test_client.post(
        f"/forms/{form['id']}/responses",
        json={"answers": {"email": "student@example.com", "rating": 5}},
        headers=csrf_header(test_client),
    )
    detail = test_client.get(f"/forms/{form['id']}")

    assert response.status_code == 201
    assert response.json()["answers"] == {"email": "student@example.com", "rating": 5}
    assert response.json()["form_version_id"] == form["latest_version"]["id"]
    assert detail.json()["response_count"] == 1


def test_submit_form_response_allows_anonymous_public_submissions(
    test_client: TestClient,
) -> None:
    form = test_client.post(
        "/forms",
        json=valid_form_create_payload(),
        headers=csrf_header(test_client),
    ).json()
    clear_auth_cookies(test_client)
    test_client.headers.pop("Authorization")
    test_client.headers.pop("X-CSRF-Token", None)

    response = test_client.post(
        f"/forms/{form['id']}/responses",
        json={"answers": {"email": "anon@example.com", "rating": 4}},
    )

    assert response.status_code == 201
    assert response.json()["respondent_user_id"] is None


def test_submit_form_response_rejects_invalid_answers(test_client: TestClient) -> None:
    form = test_client.post(
        "/forms",
        json=valid_form_create_payload(),
        headers=csrf_header(test_client),
    ).json()

    response = test_client.post(
        f"/forms/{form['id']}/responses",
        json={"answers": {"email": "not-an-email", "rating": 9}},
        headers=csrf_header(test_client),
    )

    assert response.status_code == 422


def test_logged_in_user_can_only_submit_once_per_form(
    test_client: TestClient,
) -> None:
    form = test_client.post(
        "/forms",
        json=valid_form_create_payload(),
        headers=csrf_header(test_client),
    ).json()

    first = test_client.post(
        f"/forms/{form['id']}/responses",
        json={"answers": {"email": "owner@example.com", "rating": 5}},
        headers=csrf_header(test_client),
    )
    second = test_client.post(
        f"/forms/{form['id']}/responses",
        json={"answers": {"email": "owner@example.com", "rating": 4}},
        headers=csrf_header(test_client),
    )

    assert first.status_code == 201
    assert second.status_code == 409


def test_different_logged_in_users_can_submit_the_same_form(
    test_client: TestClient,
) -> None:
    form = test_client.post(
        "/forms",
        json=valid_form_create_payload(),
        headers=csrf_header(test_client),
    ).json()
    second_auth = test_client.post(
        "/auth/register",
        json={"email": "second@example.com", "password": "secret123"},
    ).json()
    sync_csrf_header(test_client)

    first = test_client.post(
        f"/forms/{form['id']}/responses",
        json={"answers": {"email": "owner@example.com", "rating": 5}},
        headers=csrf_header(test_client),
    )
    second = test_client.post(
        f"/forms/{form['id']}/responses",
        json={"answers": {"email": "second@example.com", "rating": 4}},
        headers={
            "Authorization": f"Bearer {second_auth['access_token']}",
            **csrf_header(test_client),
        },
    )

    assert first.status_code == 201
    assert second.status_code == 201


def test_get_form_by_slug_reports_has_responded_for_current_user(
    test_client: TestClient,
) -> None:
    form = test_client.post(
        "/forms",
        json=valid_form_create_payload(),
        headers=csrf_header(test_client),
    ).json()
    before = test_client.get(f"/forms/slug/{form['slug']}").json()
    test_client.post(
        f"/forms/{form['id']}/responses",
        json={"answers": {"email": "owner@example.com", "rating": 5}},
        headers=csrf_header(test_client),
    )
    after = test_client.get(f"/forms/slug/{form['slug']}").json()
    clear_auth_cookies(test_client)
    test_client.headers.pop("Authorization")
    test_client.headers.pop("X-CSRF-Token", None)
    anonymous = test_client.get(f"/forms/slug/{form['slug']}").json()

    assert before["has_responded"] is False
    assert after["has_responded"] is True
    assert anonymous["has_responded"] is False


def test_list_form_responses_returns_saved_responses(test_client: TestClient) -> None:
    form = test_client.post(
        "/forms",
        json=valid_form_create_payload(),
        headers=csrf_header(test_client),
    ).json()
    test_client.post(
        f"/forms/{form['id']}/responses",
        json={"answers": {"email": "student@example.com", "rating": 5}},
        headers=csrf_header(test_client),
    )

    response = test_client.get(f"/forms/{form['id']}/responses")

    assert response.status_code == 200
    assert response.json()[0]["answers"] == {"email": "student@example.com", "rating": 5}


def test_export_form_responses_returns_csv(test_client: TestClient) -> None:
    form = test_client.post(
        "/forms",
        json=valid_form_create_payload(),
        headers=csrf_header(test_client),
    ).json()
    test_client.post(
        f"/forms/{form['id']}/responses",
        json={"answers": {"email": "student@example.com", "rating": 5}},
        headers=csrf_header(test_client),
    )

    response = test_client.get(f"/forms/{form['id']}/responses/export?format=csv")

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/csv")
    assert response.text.splitlines()[0] == "submitted_at,version,Your email,Rate this course"
    assert "student@example.com" in response.text


def test_export_form_responses_rejects_unknown_format(test_client: TestClient) -> None:
    form = test_client.post(
        "/forms",
        json=valid_form_create_payload(),
        headers=csrf_header(test_client),
    ).json()

    response = test_client.get(f"/forms/{form['id']}/responses/export?format=xlsx")

    assert response.status_code == 400
