from __future__ import annotations

import hmac
import logging
import re
import time
from uuid import uuid4

from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from app.core.config import Settings
from app.core.request_context import get_request_id

SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}
CSRF_EXEMPT_PATHS = {"/auth/login", "/auth/register"}
REQUEST_ID_HEADER = "X-Request-ID"
REQUEST_ID_PATTERN = re.compile(r"^[A-Za-z0-9_.:-]{1,128}$")


def register_middlewares(app: FastAPI, settings: Settings) -> None:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=[REQUEST_ID_HEADER],
    )

    @app.middleware("http")
    async def enforce_csrf(request: Request, call_next):
        if should_check_csrf(request, settings):
            csrf_cookie = request.cookies.get(settings.csrf_cookie_name)
            csrf_header = request.headers.get(settings.csrf_header_name)
            if not csrf_cookie or not csrf_header or not hmac.compare_digest(
                csrf_cookie,
                csrf_header,
            ):
                logging.getLogger("app.request").warning(
                    "csrf validation failed",
                    extra={
                        "event": "csrf_validation_failed",
                        "request_id": get_request_id(request),
                        "method": request.method,
                        "path": request.url.path,
                    },
                )
                response = JSONResponse(
                    status_code=status.HTTP_403_FORBIDDEN,
                    content={"detail": "invalid csrf token"},
                )
                response.headers[REQUEST_ID_HEADER] = get_request_id(request)
                return response

        return await call_next(request)

    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        logger = logging.getLogger("app.request")
        start_time = time.perf_counter()
        try:
            response = await call_next(request)
        except Exception:
            elapsed_ms = (time.perf_counter() - start_time) * 1000
            logger.exception(
                "request failed",
                extra={
                    "event": "request_failed",
                    "request_id": get_request_id(request),
                    "method": request.method,
                    "path": request.url.path,
                    "elapsed_ms": round(elapsed_ms, 2),
                },
            )
            raise

        if request.url.path == "/health":
            return response

        elapsed_ms = (time.perf_counter() - start_time) * 1000
        logger.info(
            "request complete",
            extra={
                "event": "request_complete",
                "request_id": get_request_id(request),
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "elapsed_ms": round(elapsed_ms, 2),
            },
        )
        return response

    @app.middleware("http")
    async def assign_request_id(request: Request, call_next):
        request_id = resolve_request_id(request.headers.get(REQUEST_ID_HEADER))
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers[REQUEST_ID_HEADER] = request_id
        return response


def resolve_request_id(value: str | None) -> str:
    if value and REQUEST_ID_PATTERN.fullmatch(value):
        return value

    return f"req_{uuid4().hex}"


def should_check_csrf(request: Request, settings: Settings) -> bool:
    if request.method in SAFE_METHODS or request.url.path in CSRF_EXEMPT_PATHS:
        return False

    return (
        settings.access_token_cookie_name in request.cookies
        or settings.refresh_token_cookie_name in request.cookies
    )
