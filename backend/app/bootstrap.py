from fastapi import FastAPI

import app.models  # noqa: F401
from app.core.config import get_settings
from app.core.logging import configure_logging
from app.core.middleware import register_middlewares
from app.routes.auth import router as auth_router
from app.routes.health import router as health_router
from app.routes.forms import router as forms_router
from app.routes.validation import router as validation_router


def create_app() -> FastAPI:
    settings = get_settings()
    configure_logging(settings.log_level, settings.log_format)

    app = FastAPI()
    register_middlewares(app, settings)
    app.include_router(health_router)
    app.include_router(auth_router)
    app.include_router(forms_router)
    app.include_router(validation_router)
    return app
