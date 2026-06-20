from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import AuthToken, UserCreate, UserRead

router = APIRouter(prefix="/auth", tags=["auth"])
DbSession = Annotated[Session, Depends(get_db)]


@router.post("/register", response_model=AuthToken, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserCreate, db: DbSession) -> AuthToken:
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
    return build_auth_token(user)


@router.post("/login", response_model=AuthToken)
def login_user(payload: UserCreate, db: DbSession) -> AuthToken:
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="invalid email or password",
        )

    return build_auth_token(user)


def build_auth_token(user: User) -> AuthToken:
    return AuthToken(
        access_token=create_access_token(user.id),
        user=UserRead(id=user.id, email=user.email),
    )
