import os
from functools import lru_cache

from pydantic import BaseModel


class Settings(BaseModel):
    database_url: str = "sqlite:///./dataquest.db"
    cors_origins: list[str] = [
        "http://127.0.0.1:3000",
        "http://localhost:3000",
    ]


@lru_cache
def get_settings() -> Settings:
    defaults = Settings()
    cors_origins = os.getenv("CORS_ORIGINS")

    return Settings(
        database_url=os.getenv("DATABASE_URL", defaults.database_url),
        cors_origins=(
            [origin.strip() for origin in cors_origins.split(",") if origin.strip()]
            if cors_origins
            else defaults.cors_origins
        ),
    )
