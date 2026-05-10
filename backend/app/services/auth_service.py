# backend/app/services/auth_service.py
# Business logic for authentication — signup, login, refresh, logout.
# Separates DB operations from route handlers for testability.
# Depends on: Phase 1 / User model, RefreshToken model
# Depends on: Phase 2 / utils/password.py, utils/jwt.py, schemas/auth.py

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.utils.password import hash_password, verify_password
from app.utils.jwt import create_access_token, create_refresh_token, hash_token


class AuthService:
    """Encapsulates all auth-related business logic."""

    def __init__(self, db: AsyncSession):
        self.db = db

    # ── Signup ────────────────────────────────────────────────────────
    async def signup(self, email: str, password: str, full_name: str) -> User:
        """Register a new user. Raises ValueError if email already exists."""
        # Check uniqueness
        result = await self.db.execute(select(User).where(User.email == email))
        if result.scalar_one_or_none():
            raise ValueError("EMAIL_EXISTS")

        user = User(
            email=email,
            hashed_password=hash_password(password),
            full_name=full_name,
        )
        self.db.add(user)
        await self.db.flush()  # Populate user.id before returning
        return user

    # ── Login ─────────────────────────────────────────────────────────
    async def login(self, email: str, password: str) -> tuple[User, str, str]:
        """Authenticate and return (user, access_token, raw_refresh_token).

        Raises ValueError with code on failure.
        """
        result = await self.db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

        if not user or not verify_password(password, user.hashed_password):
            raise ValueError("INVALID_CREDENTIALS")

        if not user.is_active:
            raise ValueError("ACCOUNT_DISABLED")

        access_token = create_access_token(
            subject=str(user.id),
            extra_claims={"is_admin": user.is_admin},
        )

        raw_refresh, token_hash, expires_at = create_refresh_token()
        refresh_row = RefreshToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at,
        )
        self.db.add(refresh_row)
        await self.db.flush()

        return user, access_token, raw_refresh

    # ── Refresh ───────────────────────────────────────────────────────
    async def refresh(self, raw_refresh_token: str) -> tuple[str, str]:
        """Rotate refresh token and issue new access token.

        Returns (new_access_token, new_raw_refresh_token).
        Raises ValueError on invalid/expired/revoked token.
        """
        token_h = hash_token(raw_refresh_token)
        result = await self.db.execute(
            select(RefreshToken).where(
                RefreshToken.token_hash == token_h,
                RefreshToken.is_revoked == False,  # noqa: E712
            )
        )
        refresh_row = result.scalar_one_or_none()

        if not refresh_row:
            raise ValueError("INVALID_REFRESH_TOKEN")

        if refresh_row.expires_at < datetime.now(timezone.utc):
            refresh_row.is_revoked = True
            raise ValueError("REFRESH_TOKEN_EXPIRED")

        # Revoke old token (rotation)
        refresh_row.is_revoked = True

        # Load user for claims
        user_result = await self.db.execute(
            select(User).where(User.id == refresh_row.user_id)
        )
        user = user_result.scalar_one_or_none()
        if not user or not user.is_active:
            raise ValueError("ACCOUNT_DISABLED")

        # Issue new pair
        access_token = create_access_token(
            subject=str(user.id),
            extra_claims={"is_admin": user.is_admin},
        )
        new_raw, new_hash, new_expires = create_refresh_token()
        self.db.add(RefreshToken(
            user_id=user.id,
            token_hash=new_hash,
            expires_at=new_expires,
        ))
        await self.db.flush()

        return access_token, new_raw

    # ── Logout ────────────────────────────────────────────────────────
    async def logout(self, raw_refresh_token: str | None) -> None:
        """Revoke the given refresh token. Silent success if token not found."""
        if not raw_refresh_token:
            return
        token_h = hash_token(raw_refresh_token)
        result = await self.db.execute(
            select(RefreshToken).where(RefreshToken.token_hash == token_h)
        )
        refresh_row = result.scalar_one_or_none()
        if refresh_row:
            refresh_row.is_revoked = True

    # ── Delete Account ────────────────────────────────────────────────
    async def delete_account(self, user_id: uuid.UUID) -> None:
        """Permanently delete a user and all their data (cascaded by FK)."""
        result = await self.db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if user:
            await self.db.delete(user)

# SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
