from functools import lru_cache
from pathlib import Path

from pydantic.v1 import BaseSettings, Field, validator


class Settings(BaseSettings):
    app_env: str = "development"
    database_url: str = "sqlite:///./dataquest.db"
    log_level: str = "INFO"
    log_format: str = "json"
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
    ai_provider: str = "mock"
    gemini_api_key: str | None = None
    gemini_model: str = "gemini-flash-latest"
    gemini_timeout_seconds: float = 15.0
    gemini_max_retries: int = 1
    gemini_retry_base_delay_seconds: float = 0.5
    gemini_retry_max_delay_seconds: float = 4.0
    cors_origins: list[str] = Field(
        default_factory=lambda: [
            "http://127.0.0.1:3000",
            "http://localhost:3000",
        ]
    )

    class Config:
        extra = "ignore"

        @classmethod
        def customise_sources(
            cls,
            init_settings,
            env_settings,
            file_secret_settings,
        ):
            return (
                init_settings,
                cls.dotenv_settings,
                env_settings,
                file_secret_settings,
            )

        @staticmethod
        def dotenv_settings(_: BaseSettings) -> dict[str, object]:
            return load_env_file()

        @classmethod
        def parse_env_var(cls, field_name: str, raw_value: str):  # type: ignore[override]
            if field_name == "cors_origins":
                return [origin.strip() for origin in raw_value.split(",") if origin.strip()]
            return super().parse_env_var(field_name, raw_value)

    @validator("app_env", "log_format", pre=True)
    def normalize_lowercase(cls, value: str | None) -> str | None:
        return value.lower() if isinstance(value, str) else value

    @validator("log_level", pre=True)
    def normalize_log_level(cls, value: str | None) -> str | None:
        return value.upper() if isinstance(value, str) else value

    @validator(
        "access_token_cookie_samesite",
        "csrf_cookie_samesite",
        "refresh_token_cookie_samesite",
        pre=True,
    )
    def normalize_same_site(cls, value: str | None) -> str | None:
        return value.lower() if isinstance(value, str) else value

    @validator("cors_origins", pre=True)
    def parse_cors_origins(cls, value: object) -> list[str] | object:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    validate_settings(settings)
    return settings


def validate_settings(settings: Settings) -> None:
    if settings.app_env != "production":
        return

    errors: list[str] = []
    if settings.auth_secret_key == Settings.__fields__["auth_secret_key"].default:
        errors.append("AUTH_SECRET_KEY must be changed in production")
    if not settings.access_token_cookie_secure:
        errors.append("ACCESS_TOKEN_COOKIE_SECURE must be true in production")
    if not settings.refresh_token_cookie_secure:
        errors.append("REFRESH_TOKEN_COOKIE_SECURE must be true in production")
    if not settings.csrf_cookie_secure:
        errors.append("CSRF_COOKIE_SECURE must be true in production")
    if any(is_local_origin(origin) for origin in settings.cors_origins):
        errors.append("CORS_ORIGINS must not include localhost in production")

    if errors:
        raise RuntimeError("; ".join(errors))


def is_local_origin(origin: str) -> bool:
    normalized = origin.lower()
    return (
        "localhost" in normalized
        or "127.0.0.1" in normalized
        or "0.0.0.0" in normalized
    )


def load_env_file() -> dict[str, str]:
    env_path = Path(__file__).resolve().parents[2] / ".env"
    if not env_path.exists():
        return {}

    values: dict[str, str] = {}
    for line in env_path.read_text().splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue

        key, value = stripped.split("=", 1)
        values[key.strip()] = value.strip().strip('"').strip("'")

    return values
