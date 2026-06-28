from fastapi.testclient import TestClient

from app.db.base import Base
from app.main import app


def test_app_starts_and_models_are_registered() -> None:
    with TestClient(app) as client:
        response = client.get("/health")

    assert response.status_code == 200
    assert response.headers["X-Request-ID"].startswith("req_")
    assert {"forms", "form_versions", "responses"}.issubset(Base.metadata.tables)


def test_request_id_header_is_preserved() -> None:
    with TestClient(app) as client:
        response = client.get("/health", headers={"X-Request-ID": "frontend-request-1"})

    assert response.status_code == 200
    assert response.headers["X-Request-ID"] == "frontend-request-1"


def test_invalid_request_id_header_is_replaced() -> None:
    with TestClient(app) as client:
        response = client.get("/health", headers={"X-Request-ID": "bad request id"})

    assert response.status_code == 200
    assert response.headers["X-Request-ID"].startswith("req_")
