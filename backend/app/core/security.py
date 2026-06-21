from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import secrets
from datetime import UTC, datetime, timedelta
from uuid import UUID

from fastapi import HTTPException, status

from app.core.config import Settings, get_settings

PASSWORD_ITERATIONS = 210_000


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        PASSWORD_ITERATIONS,
    )
    return (
        f"pbkdf2_sha256${PASSWORD_ITERATIONS}$"
        f"{base64.urlsafe_b64encode(salt).decode()}$"
        f"{base64.urlsafe_b64encode(digest).decode()}"
    )


def verify_password(password: str, password_hash: str) -> bool:
    try:
        algorithm, iterations, encoded_salt, encoded_digest = password_hash.split("$", 3)
    except ValueError:
        return False

    if algorithm != "pbkdf2_sha256":
        return False

    salt = base64.urlsafe_b64decode(encoded_salt.encode())
    expected_digest = base64.urlsafe_b64decode(encoded_digest.encode())
    actual_digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        int(iterations),
    )
    return hmac.compare_digest(actual_digest, expected_digest)


def create_access_token(user_id: UUID, settings: Settings | None = None) -> str:
    resolved_settings = settings or get_settings()
    now = datetime.now(UTC)
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "sub": str(user_id),
        "iat": int(now.timestamp()),
        "exp": int(
            (now + timedelta(seconds=resolved_settings.access_token_ttl_seconds)).timestamp()
        ),
    }
    signing_input = f"{base64url_json(header)}.{base64url_json(payload)}"
    signature = sign_token(signing_input, resolved_settings.auth_secret_key)
    return f"{signing_input}.{signature}"


def create_refresh_token() -> str:
    return base64url_encode(secrets.token_bytes(48))


def create_csrf_token() -> str:
    return base64url_encode(secrets.token_bytes(32))


def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def decode_access_token(token: str, settings: Settings | None = None) -> UUID:
    resolved_settings = settings or get_settings()
    try:
        header, payload, signature = token.split(".", 2)
    except ValueError as error:
        raise credentials_error() from error

    signing_input = f"{header}.{payload}"
    expected_signature = sign_token(signing_input, resolved_settings.auth_secret_key)
    if not hmac.compare_digest(signature, expected_signature):
        raise credentials_error()

    try:
        payload_data = json.loads(base64url_decode(payload))
        expires_at = int(payload_data["exp"])
        subject = UUID(str(payload_data["sub"]))
    except (KeyError, TypeError, ValueError) as error:
        raise credentials_error() from error

    if expires_at < int(datetime.now(UTC).timestamp()):
        raise credentials_error()

    return subject


def base64url_json(value: dict) -> str:
    return base64url_encode(json.dumps(value, separators=(",", ":")).encode())


def base64url_encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).rstrip(b"=").decode()


def base64url_decode(value: str) -> str:
    padding = "=" * (-len(value) % 4)
    return base64.urlsafe_b64decode(f"{value}{padding}").decode()


def sign_token(signing_input: str, secret: str) -> str:
    digest = hmac.new(secret.encode(), signing_input.encode(), hashlib.sha256).digest()
    return base64url_encode(digest)


def credentials_error() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="invalid authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
