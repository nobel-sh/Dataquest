from datetime import UTC, datetime, timedelta
from typing import Annotated
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    hash_refresh_token,
    verify_password,
)
from app.db.session import get_db
from app.models.refresh_token import RefreshToken
from app.models.user import User
from app.routes.dependencies import get_current_user
from app.schemas.auth import AuthToken, UserCreate, UserRead

router = APIRouter(prefix="/auth", tags=["auth"])
DbSession = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]


@router.post("/register", response_model=AuthToken, status_code=status.HTTP_201_CREATED)
def register_user(
    payload: UserCreate,
    request: Request,
    response: Response,
    db: DbSession,
) -> AuthToken:
    user = User(email=payload.email.lower(), password_hash=hash_password(payload.password))
    db.add(user)

    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="email already registered",
        ) from error

    db.refresh(user)
    revoke_refresh_token_from_request(request, db)
    return issue_session(user, db, response)


@router.post("/login", response_model=AuthToken)
def login_user(
    payload: UserCreate,
    request: Request,
    response: Response,
    db: DbSession,
) -> AuthToken:
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="invalid email or password",
        )

    revoke_refresh_token_from_request(request, db)
    return issue_session(user, db, response)


@router.post("/refresh", response_model=AuthToken)
def refresh_session(request: Request, response: Response, db: DbSession) -> AuthToken:
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
    access_token = build_auth_token(user)
    set_access_cookie(response, access_token.access_token)
    set_refresh_cookie(response, response_token)
    return access_token


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout_session(request: Request, response: Response, db: DbSession) -> None:
    try:
        refresh_token = get_refresh_token_from_request(request, db)
        if refresh_token is not None and refresh_token.revoked_at is None:
            refresh_token.revoked_at = utc_now()
            db.commit()
    finally:
        clear_access_cookie(response)
        clear_refresh_cookie(response)


@router.get("/me", response_model=UserRead)
def get_me(current_user: CurrentUser) -> UserRead:
    return UserRead(id=current_user.id, email=current_user.email)


def issue_session(user: User, db: Session, response: Response) -> AuthToken:
    refresh_token_value = create_session_refresh_token(user, db)
    db.commit()
    auth_token = build_auth_token(user)
    set_access_cookie(response, auth_token.access_token)
    set_refresh_cookie(response, refresh_token_value)
    return auth_token


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
            revoke_refresh_token_family(refresh_token, db)
            db.commit()
        return None

    if to_utc_datetime(refresh_token.expires_at) <= utc_now():
        refresh_token.revoked_at = utc_now()
        db.commit()
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
