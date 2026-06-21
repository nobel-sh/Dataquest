from typing import Annotated

from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import credentials_error, decode_access_token
from app.db.session import get_db
from app.models.user import User

bearer_scheme = HTTPBearer(auto_error=False)
optional_bearer_scheme = HTTPBearer(auto_error=False)
DbSession = Annotated[Session, Depends(get_db)]


def get_current_user(
    request: Request,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    db: DbSession,
) -> User:
    token = get_access_token(request, credentials)
    if token is None:
        raise credentials_error()

    user_id = decode_access_token(token)
    user = db.get(User, user_id)
    if user is None:
        raise credentials_error()
    return user


def get_optional_current_user(
    request: Request,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(optional_bearer_scheme)],
    db: DbSession,
) -> User | None:
    token = get_access_token(request, credentials)
    if token is None:
        return None

    user_id = decode_access_token(token)
    user = db.get(User, user_id)
    if user is None:
        raise credentials_error()
    return user


def get_access_token(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None,
) -> str | None:
    if credentials is not None:
        return credentials.credentials

    return request.cookies.get(get_settings().access_token_cookie_name)
