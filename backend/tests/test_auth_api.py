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


@pytest.fixture
def client(monkeypatch: pytest.MonkeyPatch) -> Generator[TestClient]:
    monkeypatch.setenv("AI_PROVIDER", "mock")
    get_settings.cache_clear()

    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    testing_session_local = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(engine)

    def override_get_db() -> Generator[Session]:
        with testing_session_local() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
    get_settings.cache_clear()


def test_register_returns_bearer_token(client: TestClient) -> None:
    response = client.post(
        "/auth/register",
        json={"email": "owner@example.com", "password": "password123"},
    )

    assert response.status_code == 201
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]
    assert body["user"]["email"] == "owner@example.com"
    assert get_access_cookie(response) is not None
    assert get_csrf_cookie(response) is not None
    assert get_refresh_cookie(response) is not None


def test_register_rejects_duplicate_email(client: TestClient) -> None:
    payload = {"email": "owner@example.com", "password": "password123"}

    first_response = client.post("/auth/register", json=payload)
    second_response = client.post("/auth/register", json=payload)

    assert first_response.status_code == 201
    assert second_response.status_code == 409


def test_login_returns_token_for_valid_credentials(client: TestClient) -> None:
    payload = {"email": "owner@example.com", "password": "password123"}
    client.post("/auth/register", json=payload)

    response = client.post("/auth/login", json=payload)

    assert response.status_code == 200
    assert response.json()["access_token"]
    assert get_access_cookie(response) is not None
    assert get_csrf_cookie(response) is not None
    assert get_refresh_cookie(response) is not None


def test_login_rejects_invalid_credentials(client: TestClient) -> None:
    client.post(
        "/auth/register",
        json={"email": "owner@example.com", "password": "password123"},
    )

    response = client.post(
        "/auth/login",
        json={"email": "owner@example.com", "password": "wrongpassword"},
    )

    assert response.status_code == 401


def test_get_me_returns_current_user(client: TestClient) -> None:
    register_response = client.post(
        "/auth/register",
        json={"email": "owner@example.com", "password": "password123"},
    )
    token = register_response.json()["access_token"]

    response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    assert response.json() == register_response.json()["user"]


def test_get_me_accepts_access_cookie(client: TestClient) -> None:
    register_response = client.post(
        "/auth/register",
        json={"email": "owner@example.com", "password": "password123"},
    )

    response = client.get("/auth/me")

    assert response.status_code == 200
    assert response.json() == register_response.json()["user"]

def test_get_me_rejects_invalid_token(client: TestClient) -> None:
    response = client.get("/auth/me", headers={"Authorization": "Bearer invalid-token"})

    assert response.status_code == 401


def test_update_email_changes_current_user_email(client: TestClient) -> None:
    client.post(
        "/auth/register",
        json={"email": "owner@example.com", "password": "password123"},
    )

    response = client.patch(
        "/auth/me",
        json={
            "current_password": "password123",
            "email": "new-owner@example.com",
        },
        headers=csrf_header(client),
    )

    assert response.status_code == 200
    assert response.json()["email"] == "new-owner@example.com"

    me_response = client.get("/auth/me")
    assert me_response.json()["email"] == "new-owner@example.com"


def test_update_password_changes_login_password(client: TestClient) -> None:
    client.post(
        "/auth/register",
        json={"email": "owner@example.com", "password": "password123"},
    )

    response = client.patch(
        "/auth/password",
        json={
            "current_password": "password123",
            "new_password": "password456",
        },
        headers=csrf_header(client),
    )

    assert response.status_code == 200
    assert response.json()["email"] == "owner@example.com"

    login_response = client.post(
        "/auth/login",
        json={"email": "owner@example.com", "password": "password456"},
    )
    assert login_response.status_code == 200


def test_refresh_session_rotates_refresh_cookie(client: TestClient) -> None:
    payload = {"email": "owner@example.com", "password": "password123"}
    register_response = client.post("/auth/register", json=payload)
    cookie_name = get_settings().refresh_token_cookie_name
    first_refresh_token = client.cookies.get(cookie_name)

    response = client.post("/auth/refresh", headers=csrf_header(client))

    assert response.status_code == 200
    assert response.json()["access_token"]
    assert client.cookies.get(get_settings().access_token_cookie_name) is not None
    assert client.cookies.get(cookie_name) is not None
    assert client.cookies.get(cookie_name) != first_refresh_token
    assert get_refresh_cookie(register_response) is not None


def test_refresh_session_rejects_invalid_cookie(client: TestClient) -> None:
    cookie_name = get_settings().refresh_token_cookie_name
    client.cookies.set(cookie_name, "invalid-refresh-token")
    client.cookies.set(get_settings().csrf_cookie_name, "csrf-token")

    response = client.post("/auth/refresh", headers=csrf_header(client))

    assert response.status_code == 401


def test_refresh_session_requires_csrf_for_cookie_auth(client: TestClient) -> None:
    client.post(
        "/auth/register",
        json={"email": "owner@example.com", "password": "password123"},
    )

    response = client.post("/auth/refresh")

    assert response.status_code == 403
    assert response.json()["detail"] == "invalid csrf token"


def test_refresh_token_reuse_revokes_session_family(client: TestClient) -> None:
    cookie_name = get_settings().refresh_token_cookie_name
    client.post(
        "/auth/register",
        json={"email": "owner@example.com", "password": "password123"},
    )
    first_refresh_token = client.cookies.get(cookie_name)

    refresh_response = client.post("/auth/refresh", headers=csrf_header(client))
    second_refresh_token = client.cookies.get(cookie_name)

    assert refresh_response.status_code == 200
    assert first_refresh_token is not None
    assert second_refresh_token is not None
    assert second_refresh_token != first_refresh_token

    client.cookies.set(cookie_name, first_refresh_token)
    reuse_response = client.post("/auth/refresh", headers=csrf_header(client))
    client.cookies.set(cookie_name, second_refresh_token)
    latest_token_response = client.post("/auth/refresh", headers=csrf_header(client))

    assert reuse_response.status_code == 401
    assert latest_token_response.status_code == 401


def test_logout_session_clears_refresh_cookie(client: TestClient) -> None:
    client.post(
        "/auth/register",
        json={"email": "owner@example.com", "password": "password123"},
    )
    access_cookie_name = get_settings().access_token_cookie_name
    cookie_name = get_settings().refresh_token_cookie_name
    assert client.cookies.get(access_cookie_name) is not None
    assert client.cookies.get(cookie_name) is not None

    response = client.post("/auth/logout", headers=csrf_header(client))

    assert response.status_code == 204
    assert client.cookies.get(access_cookie_name) is None
    assert client.cookies.get(get_settings().csrf_cookie_name) is None
    assert client.cookies.get(cookie_name) is None


def test_create_form_requires_authentication(client: TestClient) -> None:
    response = client.post(
        "/forms",
        json={
            "slug": "student-feedback",
            "schema": {
                "title": "Student Feedback",
                "fields": [
                    {"id": "email", "type": "email", "label": "Email", "required": True},
                ],
            },
        },
    )

    assert response.status_code == 401


def get_refresh_cookie(response) -> str | None:
    cookie_name = get_settings().refresh_token_cookie_name
    return response.cookies.get(cookie_name)


def get_access_cookie(response) -> str | None:
    cookie_name = get_settings().access_token_cookie_name
    return response.cookies.get(cookie_name)


def get_csrf_cookie(response) -> str | None:
    cookie_name = get_settings().csrf_cookie_name
    return response.cookies.get(cookie_name)


def csrf_header(client: TestClient) -> dict[str, str]:
    token = client.cookies.get(get_settings().csrf_cookie_name)
    return {get_settings().csrf_header_name: token or ""}
