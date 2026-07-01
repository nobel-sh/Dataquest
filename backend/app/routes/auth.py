import logging
from typing import Annotated

from fastapi import APIRouter, Depends, Request, Response, status
from sqlalchemy.orm import Session

from app.core.request_context import get_request_id
from app.db.session import get_db
from app.models.user import User
from app.routes.dependencies import get_current_user
from app.schemas.auth import (
    AuthToken,
    EmailUpdate,
    PasswordResetConfirm,
    PasswordResetRequest,
    PasswordResetStart,
    PasswordUpdate,
    UserCreate,
    UserRead,
)
from app.services import auth_session
from app.services.users import (
    authenticate_user,
    build_user_read,
    register_user_record,
    request_password_reset,
    reset_user_password,
    update_user_email,
    update_user_password,
)

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
    user = register_user_record(payload, request, db)
    auth_token = auth_session.issue_session(user, db, response)
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
    user = authenticate_user(payload, request, db)
    auth_token = auth_session.issue_session(user, db, response)
    logger.info(
        "user logged in",
        extra={
            "event": "user_logged_in",
            "request_id": get_request_id(request),
            "user_id": user.id,
        },
    )
    return auth_token


@router.post("/password-reset", response_model=PasswordResetStart)
def start_password_reset(
    payload: PasswordResetRequest,
    request: Request,
    db: DbSession,
) -> PasswordResetStart:
    reset = request_password_reset(payload, db)
    logger.info(
        "password reset requested",
        extra={
            "event": "password_reset_requested",
            "request_id": get_request_id(request),
            "email": payload.email,
            "token_issued": reset.reset_token is not None,
        },
    )
    return reset


@router.post("/password-reset/confirm", response_model=UserRead)
def confirm_password_reset(
    payload: PasswordResetConfirm,
    request: Request,
    db: DbSession,
) -> UserRead:
    user = reset_user_password(payload, db)
    logger.info(
        "password reset completed",
        extra={
            "event": "password_reset_completed",
            "request_id": get_request_id(request),
            "user_id": user.id,
        },
    )
    return user


@router.post("/refresh", response_model=AuthToken)
def refresh_session(request: Request, response: Response, db: DbSession) -> AuthToken:
    return auth_session.refresh_session(request, db, response)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout_session(request: Request, response: Response, db: DbSession) -> None:
    auth_session.logout_session(request, db, response)


@router.get("/me", response_model=UserRead)
def get_me(current_user: CurrentUser) -> UserRead:
    return build_user_read(current_user)


@router.patch("/me", response_model=UserRead)
def update_email(
    payload: EmailUpdate,
    request: Request,
    current_user: CurrentUser,
    db: DbSession,
) -> UserRead:
    user = update_user_email(payload, current_user, db)
    logger.info(
        "user email updated",
        extra={
            "event": "user_email_updated",
            "request_id": get_request_id(request),
            "user_id": current_user.id,
        },
    )
    return user


@router.patch("/password", response_model=UserRead)
def update_password(
    payload: PasswordUpdate,
    request: Request,
    current_user: CurrentUser,
    db: DbSession,
) -> UserRead:
    user = update_user_password(payload, request, current_user, db)
    logger.info(
        "user password updated",
        extra={
            "event": "user_password_updated",
            "request_id": get_request_id(request),
            "user_id": current_user.id,
        },
    )
    return user
