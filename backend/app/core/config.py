import os
from functools import lru_cache
from pathlib import Path

from pydantic import BaseModel


class Settings(BaseModel):
    database_url: str = "sqlite:///./dataquest.db"
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
        ai_provider=os.getenv("AI_PROVIDER", defaults.ai_provider),
        gemini_api_key=os.getenv("GEMINI_API_KEY", defaults.gemini_api_key),
        gemini_model=os.getenv("GEMINI_MODEL", defaults.gemini_model),
        cors_origins=(
            [origin.strip() for origin in cors_origins.split(",") if origin.strip()]
            if cors_origins
            else defaults.cors_origins
        ),
    )


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
