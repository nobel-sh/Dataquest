import logging
import time

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.requests import Request

import app.models  # noqa: F401
from app.core.config import get_settings
from app.core.logging import configure_logging
from app.routes.auth import router as auth_router
from app.routes.forms import router as forms_router
from app.schemas.agent import FormReviewResult
from app.schemas.form import FormSchema
from app.schemas.form_response import FormResponseSubmission

settings = get_settings()
configure_logging(settings.log_level)
logger = logging.getLogger("app.request")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)
app.include_router(forms_router)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.perf_counter()
    try:
        response = await call_next(request)
    except Exception:
        elapsed_ms = (time.perf_counter() - start_time) * 1000
        logger.exception(
            "request failed method=%s path=%s elapsed_ms=%.2f",
            request.method,
            request.url.path,
            elapsed_ms,
        )
        raise

    if request.url.path == "/health":
        return response

    elapsed_ms = (time.perf_counter() - start_time) * 1000
    logger.info(
        "request complete method=%s path=%s status_code=%s elapsed_ms=%.2f",
        request.method,
        request.url.path,
        response.status_code,
        elapsed_ms,
    )
    return response


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/schemas/validate", response_model=FormSchema)
def validate_schema(schema: FormSchema) -> FormSchema:
    return schema


@app.post("/responses/validate", response_model=FormResponseSubmission)
def validate_response(submission: FormResponseSubmission) -> FormResponseSubmission:
    return submission


@app.post("/agents/review/validate", response_model=FormReviewResult)
def validate_review_result(review_result: FormReviewResult) -> FormReviewResult:
    return review_result
