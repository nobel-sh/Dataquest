import os
from functools import lru_cache
from pathlib import Path

from pydantic import BaseModel


class Settings(BaseModel):
    database_url: str = "sqlite:///./dataquest.db"
    log_level: str = "INFO"
    auth_secret_key: str = "change-me-in-development"
    access_token_ttl_seconds: int = 60 * 15
    access_token_cookie_name: str = "dataquest_access_token"
    access_token_cookie_path: str = "/"
    access_token_cookie_secure: bool = False
    access_token_cookie_samesite: str = "lax"
    csrf_cookie_name: str = "dataquest_csrf_token"
    csrf_header_name: str = "X-CSRF-Token"
    csrf_cookie_path: str = "/"
    csrf_cookie_secure: bool = False
    csrf_cookie_samesite: str = "lax"
    refresh_token_ttl_seconds: int = 60 * 60 * 24 * 30
    refresh_token_cookie_name: str = "dataquest_refresh_token"
    refresh_token_cookie_path: str = "/auth"
    refresh_token_cookie_secure: bool = False
    refresh_token_cookie_samesite: str = "lax"
    cors_origins: list[str] = [
        "http://127.0.0.1:3000",
        "http://localhost:3000",
    ]
    ai_provider: str = "mock"
    gemini_api_key: str | None = None
    gemini_model: str = "gemini-flash-latest"


@lru_cache
def get_settings() -> Settings:
    load_env_file()
    defaults = Settings()
    cors_origins = os.getenv("CORS_ORIGINS")

    return Settings(
        database_url=os.getenv("DATABASE_URL", defaults.database_url),
        log_level=os.getenv("LOG_LEVEL", defaults.log_level).upper(),
        auth_secret_key=os.getenv("AUTH_SECRET_KEY", defaults.auth_secret_key),
        access_token_ttl_seconds=int(
            os.getenv("ACCESS_TOKEN_TTL_SECONDS", defaults.access_token_ttl_seconds)
        ),
        access_token_cookie_name=os.getenv(
            "ACCESS_TOKEN_COOKIE_NAME",
            defaults.access_token_cookie_name,
        ),
        access_token_cookie_path=os.getenv(
            "ACCESS_TOKEN_COOKIE_PATH",
            defaults.access_token_cookie_path,
        ),
        access_token_cookie_secure=_parse_bool(
            os.getenv("ACCESS_TOKEN_COOKIE_SECURE"),
            defaults.access_token_cookie_secure,
        ),
        access_token_cookie_samesite=os.getenv(
            "ACCESS_TOKEN_COOKIE_SAMESITE",
            defaults.access_token_cookie_samesite,
        ).lower(),
        csrf_cookie_name=os.getenv("CSRF_COOKIE_NAME", defaults.csrf_cookie_name),
        csrf_header_name=os.getenv("CSRF_HEADER_NAME", defaults.csrf_header_name),
        csrf_cookie_path=os.getenv("CSRF_COOKIE_PATH", defaults.csrf_cookie_path),
        csrf_cookie_secure=_parse_bool(
            os.getenv("CSRF_COOKIE_SECURE"),
            defaults.csrf_cookie_secure,
        ),
        csrf_cookie_samesite=os.getenv(
            "CSRF_COOKIE_SAMESITE",
            defaults.csrf_cookie_samesite,
        ).lower(),
        refresh_token_ttl_seconds=int(
            os.getenv("REFRESH_TOKEN_TTL_SECONDS", defaults.refresh_token_ttl_seconds)
        ),
        refresh_token_cookie_name=os.getenv(
            "REFRESH_TOKEN_COOKIE_NAME",
            defaults.refresh_token_cookie_name,
        ),
        refresh_token_cookie_path=os.getenv(
            "REFRESH_TOKEN_COOKIE_PATH",
            defaults.refresh_token_cookie_path,
        ),
        refresh_token_cookie_secure=_parse_bool(
            os.getenv("REFRESH_TOKEN_COOKIE_SECURE"),
            defaults.refresh_token_cookie_secure,
        ),
        refresh_token_cookie_samesite=os.getenv(
            "REFRESH_TOKEN_COOKIE_SAMESITE",
            defaults.refresh_token_cookie_samesite,
        ).lower(),
        ai_provider=os.getenv("AI_PROVIDER", defaults.ai_provider),
        gemini_api_key=os.getenv("GEMINI_API_KEY", defaults.gemini_api_key),
        gemini_model=os.getenv("GEMINI_MODEL", defaults.gemini_model),
        cors_origins=(
            [origin.strip() for origin in cors_origins.split(",") if origin.strip()]
            if cors_origins
            else defaults.cors_origins
        ),
    )


def _parse_bool(value: str | None, default: bool) -> bool:
    if value is None:
        return default

    normalized = value.strip().lower()
    if normalized in {"1", "true", "yes", "on"}:
        return True
    if normalized in {"0", "false", "no", "off"}:
        return False
    return default


def load_env_file() -> None:
    env_path = Path(__file__).resolve().parents[2] / ".env"
    if not env_path.exists():
        return

    for line in env_path.read_text().splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue

        key, value = stripped.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))
