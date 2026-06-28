from __future__ import annotations

import logging
from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid4

from fastapi import HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.request_context import get_request_id
from app.core.security import (
    create_access_token,
    create_csrf_token,
    create_refresh_token,
    hash_refresh_token,
)
from app.models.refresh_token import RefreshToken
from app.models.user import User
from app.schemas.auth import AuthToken, UserRead

logger = logging.getLogger("app.auth")


def issue_session(user: User, db: Session, response: Response) -> AuthToken:
    refresh_token_value = create_session_refresh_token(user, db)
    db.commit()
    auth_token = build_auth_token(user)
    set_access_cookie(response, auth_token.access_token)
    set_refresh_cookie(response, refresh_token_value)
    set_csrf_cookie(response)
    return auth_token


def refresh_session(request: Request, db: Session, response: Response) -> AuthToken:
    refresh_token = get_refresh_token_from_request(request, db, detect_reuse=True)
    if refresh_token is None:
        clear_access_cookie(response)
        clear_refresh_cookie(response)
        raise refresh_token_error()

    user = refresh_token.user
    refresh_token.revoked_at = utc_now()
    refresh_token.last_used_at = utc_now()
    response_token = create_session_refresh_token(user, db, refresh_token.session_id)
    db.commit()
    auth_token = build_auth_token(user)
    set_access_cookie(response, auth_token.access_token)
    set_refresh_cookie(response, response_token)
    set_csrf_cookie(response)
    logger.info(
        "session refreshed",
        extra={
            "event": "session_refreshed",
            "request_id": get_request_id(request),
            "user_id": user.id,
            "session_id": refresh_token.session_id,
        },
    )
    return auth_token


def logout_session(request: Request, db: Session, response: Response) -> None:
    try:
        refresh_token = get_refresh_token_from_request(request, db)
        if refresh_token is not None and refresh_token.revoked_at is None:
            refresh_token.revoked_at = utc_now()
            db.commit()
            logger.info(
                "session logged out",
                extra={
                    "event": "session_logged_out",
                    "request_id": get_request_id(request),
                    "user_id": refresh_token.user_id,
                    "session_id": refresh_token.session_id,
                },
            )
    finally:
        clear_access_cookie(response)
        clear_refresh_cookie(response)
        clear_csrf_cookie(response)


def create_session_refresh_token(user: User, db: Session, session_id: UUID | None = None) -> str:
    settings = get_settings()
    token_value = create_refresh_token()
    db.add(
        RefreshToken(
            user=user,
            session_id=session_id or uuid4(),
            token_hash=hash_refresh_token(token_value),
            expires_at=utc_now() + timedelta(seconds=settings.refresh_token_ttl_seconds),
        )
    )
    return token_value


def get_refresh_token_from_request(
    request: Request,
    db: Session,
    detect_reuse: bool = False,
) -> RefreshToken | None:
    token_value = request.cookies.get(get_settings().refresh_token_cookie_name)
    if token_value is None:
        return None

    refresh_token = db.scalar(
        select(RefreshToken).where(RefreshToken.token_hash == hash_refresh_token(token_value))
    )
    if refresh_token is None:
        return None

    if refresh_token.revoked_at is not None:
        if detect_reuse:
            logger.warning(
                "refresh token reuse detected",
                extra={
                    "event": "refresh_token_reuse_detected",
                    "request_id": get_request_id(request),
                    "user_id": refresh_token.user_id,
                    "session_id": refresh_token.session_id,
                },
            )
            revoke_refresh_token_family(refresh_token, db)
            db.commit()
        return None

    if to_utc_datetime(refresh_token.expires_at) <= utc_now():
        refresh_token.revoked_at = utc_now()
        db.commit()
        logger.info(
            "expired refresh token revoked",
            extra={
                "event": "expired_refresh_token_revoked",
                "request_id": get_request_id(request),
                "user_id": refresh_token.user_id,
                "session_id": refresh_token.session_id,
            },
        )
        return None

    return refresh_token


def revoke_refresh_token_from_request(request: Request, db: Session) -> None:
    refresh_token = get_refresh_token_from_request(request, db)
    if refresh_token is None:
        return

    refresh_token.revoked_at = utc_now()


def revoke_refresh_token_family(refresh_token: RefreshToken, db: Session) -> None:
    now = utc_now()
    db.query(RefreshToken).filter(
        RefreshToken.session_id == refresh_token.session_id,
        RefreshToken.revoked_at.is_(None),
    ).update({RefreshToken.revoked_at: now}, synchronize_session=False)


def revoke_user_refresh_tokens(user_id: UUID, db: Session) -> None:
    now = utc_now()
    db.query(RefreshToken).filter(
        RefreshToken.user_id == user_id,
        RefreshToken.revoked_at.is_(None),
    ).update({RefreshToken.revoked_at: now}, synchronize_session=False)


def set_refresh_cookie(response: Response, token_value: str) -> None:
    settings = get_settings()
    response.set_cookie(
        key=settings.refresh_token_cookie_name,
        value=token_value,
        max_age=settings.refresh_token_ttl_seconds,
        expires=settings.refresh_token_ttl_seconds,
        path=settings.refresh_token_cookie_path,
        secure=settings.refresh_token_cookie_secure,
        httponly=True,
        samesite=settings.refresh_token_cookie_samesite,
    )


def set_access_cookie(response: Response, token_value: str) -> None:
    settings = get_settings()
    response.set_cookie(
        key=settings.access_token_cookie_name,
        value=token_value,
        max_age=settings.access_token_ttl_seconds,
        expires=settings.access_token_ttl_seconds,
        path=settings.access_token_cookie_path,
        secure=settings.access_token_cookie_secure,
        httponly=True,
        samesite=settings.access_token_cookie_samesite,
    )


def set_csrf_cookie(response: Response) -> None:
    settings = get_settings()
    response.set_cookie(
        key=settings.csrf_cookie_name,
        value=create_csrf_token(),
        max_age=settings.refresh_token_ttl_seconds,
        expires=settings.refresh_token_ttl_seconds,
        path=settings.csrf_cookie_path,
        secure=settings.csrf_cookie_secure,
        httponly=False,
        samesite=settings.csrf_cookie_samesite,
    )


def clear_refresh_cookie(response: Response) -> None:
    settings = get_settings()
    response.delete_cookie(
        key=settings.refresh_token_cookie_name,
        path=settings.refresh_token_cookie_path,
    )


def clear_access_cookie(response: Response) -> None:
    settings = get_settings()
    response.delete_cookie(
        key=settings.access_token_cookie_name,
        path=settings.access_token_cookie_path,
    )


def clear_csrf_cookie(response: Response) -> None:
    settings = get_settings()
    response.delete_cookie(
        key=settings.csrf_cookie_name,
        path=settings.csrf_cookie_path,
    )


def refresh_token_error() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="invalid refresh token",
    )


def build_auth_token(user: User) -> AuthToken:
    return AuthToken(
        access_token=create_access_token(user.id),
        user=UserRead(id=user.id, email=user.email),
    )


def utc_now() -> datetime:
    return datetime.now(UTC)


def to_utc_datetime(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)
