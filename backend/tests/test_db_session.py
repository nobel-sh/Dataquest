import pytest
from sqlalchemy import text
from sqlalchemy.orm import sessionmaker

from app.core.config import Settings, get_settings
from app.db.session import create_db_engine, get_db


def test_settings_default_database_url() -> None:
    settings = Settings()

    assert settings.database_url == "sqlite:///./dataquest.db"
    assert "http://127.0.0.1:3000" in settings.cors_origins


def test_get_settings_is_cached() -> None:
    assert get_settings() is get_settings()


def test_get_settings_reads_database_url_env(monkeypatch) -> None:
    get_settings.cache_clear()
    monkeypatch.setenv("DATABASE_URL", "sqlite:///./test.db")

    assert get_settings().database_url == "sqlite:///./test.db"

    get_settings.cache_clear()


def test_get_settings_reads_cors_origins_env(monkeypatch) -> None:
    get_settings.cache_clear()
    monkeypatch.setenv("CORS_ORIGINS", "http://localhost:3000, http://example.test")

    assert get_settings().cors_origins == ["http://localhost:3000", "http://example.test"]

    get_settings.cache_clear()


def test_get_settings_rejects_insecure_production_config(monkeypatch) -> None:
    get_settings.cache_clear()
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("AUTH_SECRET_KEY", "change-me-in-development")
    monkeypatch.setenv("ACCESS_TOKEN_COOKIE_SECURE", "false")
    monkeypatch.setenv("REFRESH_TOKEN_COOKIE_SECURE", "false")
    monkeypatch.setenv("CSRF_COOKIE_SECURE", "false")
    monkeypatch.setenv("CORS_ORIGINS", "http://localhost:3000")

    with pytest.raises(RuntimeError, match="AUTH_SECRET_KEY"):
        get_settings()

    get_settings.cache_clear()


def test_get_settings_accepts_secure_production_config(monkeypatch) -> None:
    get_settings.cache_clear()
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("AUTH_SECRET_KEY", "prod-secret-that-is-not-the-default")
    monkeypatch.setenv("ACCESS_TOKEN_COOKIE_SECURE", "true")
    monkeypatch.setenv("REFRESH_TOKEN_COOKIE_SECURE", "true")
    monkeypatch.setenv("CSRF_COOKIE_SECURE", "true")
    monkeypatch.setenv("CORS_ORIGINS", "https://forms.example.com")

    settings = get_settings()

    assert settings.app_env == "production"
    assert settings.cors_origins == ["https://forms.example.com"]

    get_settings.cache_clear()


def test_create_db_engine_accepts_sqlite_url() -> None:
    engine = create_db_engine("sqlite:///:memory:")

    assert str(engine.url) == "sqlite:///:memory:"


def test_get_db_yields_session() -> None:
    engine = create_db_engine("sqlite:///:memory:")
    testing_session_local = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    def override_get_db():
        with testing_session_local() as session:
            yield session

    session = next(override_get_db())

    assert session.execute(text("select 1")).scalar_one() == 1
    session.close()


def test_application_get_db_dependency_is_iterable() -> None:
    db_generator = get_db()
    session = next(db_generator)

    assert session.bind is not None
    session.close()
    db_generator.close()
