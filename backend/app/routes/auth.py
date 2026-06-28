import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.request_context import get_request_id
from app.core.security import hash_password, verify_password
from app.db.session import get_db
from app.models.user import User
from app.routes.dependencies import get_current_user
from app.services.auth_session import (
    get_refresh_token_from_request,
    issue_session as service_issue_session,
    logout_session as service_logout_session,
    refresh_session as service_refresh_session,
    revoke_refresh_token_family,
    revoke_refresh_token_from_request,
    revoke_user_refresh_tokens,
)
from app.schemas.auth import AuthToken, EmailUpdate, PasswordUpdate, UserCreate, UserRead

router = APIRouter(prefix="/auth", tags=["auth"])
DbSession = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]
logger = logging.getLogger("app.auth")


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
    auth_token = service_issue_session(user, db, response)
    logger.info(
        "user registered",
        extra={
            "event": "user_registered",
            "request_id": get_request_id(request),
            "user_id": user.id,
        },
    )
    return auth_token


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
    auth_token = service_issue_session(user, db, response)
    logger.info(
        "user logged in",
        extra={
            "event": "user_logged_in",
            "request_id": get_request_id(request),
            "user_id": user.id,
        },
    )
    return auth_token


@router.post("/refresh", response_model=AuthToken)
def refresh_session(request: Request, response: Response, db: DbSession) -> AuthToken:
    return service_refresh_session(request, db, response)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout_session(request: Request, response: Response, db: DbSession) -> None:
    service_logout_session(request, db, response)


@router.get("/me", response_model=UserRead)
def get_me(current_user: CurrentUser) -> UserRead:
    return UserRead(id=current_user.id, email=current_user.email)


@router.patch("/me", response_model=UserRead)
def update_email(
    payload: EmailUpdate,
    request: Request,
    current_user: CurrentUser,
    db: DbSession,
) -> UserRead:
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="invalid email or password",
        )

    current_user.email = payload.email.lower()
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="email already registered",
        ) from error

    db.refresh(current_user)
    logger.info(
        "user email updated",
        extra={
            "event": "user_email_updated",
            "request_id": get_request_id(request),
            "user_id": current_user.id,
        },
    )
    return UserRead(id=current_user.id, email=current_user.email)


@router.patch("/password", response_model=UserRead)
def update_password(
    payload: PasswordUpdate,
    request: Request,
    current_user: CurrentUser,
    db: DbSession,
) -> UserRead:
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="invalid email or password",
        )

    current_user.password_hash = hash_password(payload.new_password)
    current_refresh_token = get_refresh_token_from_request(request, db)
    if current_refresh_token is not None:
        revoke_refresh_token_family(current_refresh_token, db)
    else:
        revoke_user_refresh_tokens(current_user.id, db)
    db.commit()
    logger.info(
        "user password updated",
        extra={
            "event": "user_password_updated",
            "request_id": get_request_id(request),
            "user_id": current_user.id,
        },
    )
    return UserRead(id=current_user.id, email=current_user.email)
