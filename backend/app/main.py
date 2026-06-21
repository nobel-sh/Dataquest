import hmac
import logging
import time

from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

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
SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}
CSRF_EXEMPT_PATHS = {"/auth/login", "/auth/register"}

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
async def enforce_csrf(request: Request, call_next):
    if should_check_csrf(request):
        settings = get_settings()
        csrf_cookie = request.cookies.get(settings.csrf_cookie_name)
        csrf_header = request.headers.get(settings.csrf_header_name)
        if not csrf_cookie or not csrf_header or not hmac.compare_digest(
            csrf_cookie,
            csrf_header,
        ):
            logger.warning(
                "csrf validation failed method=%s path=%s",
                request.method,
                request.url.path,
            )
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"detail": "invalid csrf token"},
            )

    return await call_next(request)


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


def should_check_csrf(request: Request) -> bool:
    if request.method in SAFE_METHODS or request.url.path in CSRF_EXEMPT_PATHS:
        return False

    settings = get_settings()
    return (
        settings.access_token_cookie_name in request.cookies
        or settings.refresh_token_cookie_name in request.cookies
    )


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
