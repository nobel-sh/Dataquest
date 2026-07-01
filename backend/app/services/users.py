from __future__ import annotations

import hashlib
import hmac
import json
from datetime import UTC, datetime, timedelta
from uuid import UUID

from fastapi import HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import (
    base64url_decode,
    base64url_encode,
    hash_password,
    sign_token,
    verify_password,
)
from app.models.user import User
from app.schemas.auth import (
    EmailUpdate,
    PasswordResetConfirm,
    PasswordResetRequest,
    PasswordResetStart,
    PasswordUpdate,
    UserCreate,
    UserRead,
)
from app.services.auth_session import (
    get_refresh_token_from_request,
    revoke_refresh_token_family,
    revoke_refresh_token_from_request,
    revoke_user_refresh_tokens,
)


def register_user_record(payload: UserCreate, request: Request, db: Session) -> User:
    user = User(email=normalize_email(payload.email), password_hash=hash_password(payload.password))
    db.add(user)

    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise email_registered_error() from error

    db.refresh(user)
    revoke_refresh_token_from_request(request, db)
    return user


def authenticate_user(payload: UserCreate, request: Request, db: Session) -> User:
    user = db.scalar(select(User).where(User.email == normalize_email(payload.email)))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise invalid_credentials_error()

    revoke_refresh_token_from_request(request, db)
    return user


def update_user_email(
    payload: EmailUpdate,
    current_user: User,
    db: Session,
) -> UserRead:
    require_current_password(payload.current_password, current_user)

    current_user.email = normalize_email(payload.email)
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise email_registered_error() from error

    db.refresh(current_user)
    return build_user_read(current_user)


def update_user_password(
    payload: PasswordUpdate,
    request: Request,
    current_user: User,
    db: Session,
) -> UserRead:
    require_current_password(payload.current_password, current_user)

    current_user.password_hash = hash_password(payload.new_password)
    current_refresh_token = get_refresh_token_from_request(request, db)
    if current_refresh_token is not None:
        revoke_refresh_token_family(current_refresh_token, db)
    else:
        revoke_user_refresh_tokens(current_user.id, db)

    db.commit()
    return build_user_read(current_user)


def request_password_reset(payload: PasswordResetRequest, db: Session) -> PasswordResetStart:
    user = db.scalar(select(User).where(User.email == normalize_email(payload.email)))
    if user is None:
        return PasswordResetStart()

    if get_settings().app_env == "production":
        return PasswordResetStart()

    return PasswordResetStart(reset_token=create_password_reset_token(user))


def reset_user_password(payload: PasswordResetConfirm, db: Session) -> UserRead:
    user_id = decode_password_reset_token(payload.token)
    user = db.get(User, user_id)
    if user is None or not valid_password_reset_token(payload.token, user):
        raise invalid_reset_token_error()

    user.password_hash = hash_password(payload.new_password)
    revoke_user_refresh_tokens(user.id, db)
    db.commit()
    return build_user_read(user)


def build_user_read(user: User) -> UserRead:
    return UserRead(id=user.id, email=user.email)


def require_current_password(password: str, current_user: User) -> None:
    if not verify_password(password, current_user.password_hash):
        raise invalid_credentials_error()


def normalize_email(email: str) -> str:
    return email.lower()


def create_password_reset_token(user: User) -> str:
    settings = get_settings()
    expires_delta = timedelta(seconds=settings.password_reset_token_ttl_seconds)
    expires_at = int(
        (datetime.now(UTC) + expires_delta).timestamp()
    )
    payload = {
        "sub": str(user.id),
        "exp": expires_at,
        "pwd": password_fingerprint(user.password_hash),
    }
    encoded_payload = base64url_encode(json.dumps(payload, separators=(",", ":")).encode())
    signature = sign_token(f"password-reset.{encoded_payload}", settings.auth_secret_key)
    return f"{encoded_payload}.{signature}"


def decode_password_reset_token(token: str) -> UUID:
    try:
        encoded_payload, _signature = token.split(".", 1)
        payload = json.loads(base64url_decode(encoded_payload))
        expires_at = int(payload["exp"])
        user_id = UUID(str(payload["sub"]))
    except (KeyError, TypeError, ValueError) as error:
        raise invalid_reset_token_error() from error

    if expires_at < int(datetime.now(UTC).timestamp()):
        raise invalid_reset_token_error()

    return user_id


def valid_password_reset_token(token: str, user: User) -> bool:
    settings = get_settings()
    try:
        encoded_payload, signature = token.split(".", 1)
        payload = json.loads(base64url_decode(encoded_payload))
    except (TypeError, ValueError):
        return False

    expected_signature = sign_token(f"password-reset.{encoded_payload}", settings.auth_secret_key)
    return hmac.compare_digest(signature, expected_signature) and hmac.compare_digest(
        str(payload.get("pwd")),
        password_fingerprint(user.password_hash),
    )


def password_fingerprint(password_hash: str) -> str:
    return hashlib.sha256(password_hash.encode()).hexdigest()


def invalid_credentials_error() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="invalid email or password",
    )


def email_registered_error() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail="email already registered",
    )


def invalid_reset_token_error() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="invalid or expired reset token",
    )
