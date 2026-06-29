from __future__ import annotations

from fastapi import HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.models.user import User
from app.schemas.auth import EmailUpdate, PasswordUpdate, UserCreate, UserRead
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


def build_user_read(user: User) -> UserRead:
    return UserRead(id=user.id, email=user.email)


def require_current_password(password: str, current_user: User) -> None:
    if not verify_password(password, current_user.password_hash):
        raise invalid_credentials_error()


def normalize_email(email: str) -> str:
    return email.lower()


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
