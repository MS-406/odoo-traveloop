# backend/app/utils/jwt.py
# JWT token creation and verification utilities.
# python-jose chosen: lightweight JWT library with cryptography backend for RS/HS algorithms.
# Depends on: Phase 1 / config.py (JWT settings)

import hashlib
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt

from app.config import settings


def create_access_token(subject: str, extra_claims: dict[str, Any] | None = None) -> str:
    """Create a short-lived JWT access token.

    Args:
        subject: User ID as string (stored in 'sub' claim).
        extra_claims: Optional additional claims (e.g., is_admin).
    """
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": subject,
        "iat": now,
        "exp": expire,
        "type": "access",  # Distinguish from refresh tokens
    }
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token() -> tuple[str, str, datetime]:
    """Create a refresh token (random UUID) and return (raw_token, token_hash, expires_at).

    We store only the hash in the DB — never the raw token.
    The raw token is sent to the client as an HTTP-only cookie.
    """
    raw_token = str(uuid.uuid4())
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    return raw_token, token_hash, expires_at


def hash_token(raw_token: str) -> str:
    """Hash a raw token string using SHA-256 for DB lookup."""
    return hashlib.sha256(raw_token.encode()).hexdigest()


def decode_access_token(token: str) -> dict[str, Any]:
    """Decode and verify a JWT access token. Raises JWTError on failure."""
    payload = jwt.decode(
        token,
        settings.JWT_SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM],
    )
    # Ensure this is an access token, not a refresh token
    if payload.get("type") != "access":
        raise JWTError("Invalid token type")
    return payload

# SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
