# backend/app/routers/auth.py
# Authentication router — signup, login, refresh, logout, profile CRUD.
# Depends on: Phase 1 / database.py, User model
# Depends on: Phase 2 / auth_service.py, dependencies.py, schemas/*

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.auth import LoginRequest, MessageResponse, SignupRequest, TokenResponse
from app.schemas.user import UserRead, UserUpdate
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])

# Cookie name for refresh token — consistent across login/refresh/logout
_REFRESH_COOKIE = "refresh_token"


def _set_refresh_cookie(response: Response, raw_token: str) -> None:
    """Set the refresh token as an HTTP-only secure cookie."""
    response.set_cookie(
        key=_REFRESH_COOKIE,
        value=raw_token,
        httponly=True,       # Prevents JS access — XSS protection
        secure=False,        # Set True in production (HTTPS only)
        samesite="lax",      # CSRF protection
        max_age=7 * 24 * 3600,  # 7 days, matches REFRESH_TOKEN_EXPIRE_DAYS
        path="/",
    )


def _clear_refresh_cookie(response: Response) -> None:
    """Remove the refresh token cookie."""
    response.delete_cookie(key=_REFRESH_COOKIE, path="/")


# ── POST /auth/signup ─────────────────────────────────────────────────
@router.post(
    "/signup",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Creates a new user account. Returns the user profile (no tokens — user must login separately).",
)
async def signup(
    body: SignupRequest,
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    try:
        user = await service.signup(
            email=body.email,
            password=body.password,
            full_name=body.full_name,
        )
        return user
    except ValueError as e:
        if str(e) == "EMAIL_EXISTS":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email already exists",
            )
        raise


# ── POST /auth/login ──────────────────────────────────────────────────
@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Login and get access token",
    description="Authenticates the user and returns an access token. Refresh token is set as an HTTP-only cookie.",
)
async def login(
    body: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    try:
        user, access_token, raw_refresh = await service.login(
            email=body.email,
            password=body.password,
        )
    except ValueError as e:
        code = str(e)
        if code == "INVALID_CREDENTIALS":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        if code == "ACCOUNT_DISABLED":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account has been disabled",
            )
        raise

    _set_refresh_cookie(response, raw_refresh)
    return TokenResponse(access_token=access_token)


# ── POST /auth/refresh ───────────────────────────────────────────────
@router.post(
    "/refresh",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Refresh access token",
    description="Uses the HTTP-only refresh cookie to issue a new access token and rotate the refresh token.",
)
async def refresh(
    response: Response,
    refresh_token: str | None = Cookie(None, alias=_REFRESH_COOKIE),
    db: AsyncSession = Depends(get_db),
):
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No refresh token provided",
        )

    service = AuthService(db)
    try:
        access_token, new_raw_refresh = await service.refresh(refresh_token)
    except ValueError as e:
        _clear_refresh_cookie(response)
        code = str(e)
        detail_map = {
            "INVALID_REFRESH_TOKEN": "Invalid refresh token",
            "REFRESH_TOKEN_EXPIRED": "Refresh token has expired — please login again",
            "ACCOUNT_DISABLED": "Your account has been disabled",
        }
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail_map.get(code, "Authentication failed"),
        )

    _set_refresh_cookie(response, new_raw_refresh)
    return TokenResponse(access_token=access_token)


# ── POST /auth/logout ────────────────────────────────────────────────
@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Logout and revoke refresh token",
)
async def logout(
    response: Response,
    refresh_token: str | None = Cookie(None, alias=_REFRESH_COOKIE),
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    await service.logout(refresh_token)
    _clear_refresh_cookie(response)
    return None


# ── GET /auth/me ──────────────────────────────────────────────────────
@router.get(
    "/me",
    response_model=UserRead,
    summary="Get current user profile",
)
async def get_me(user: User = Depends(get_current_user)):
    return user


# ── PUT /auth/me ──────────────────────────────────────────────────────
@router.put(
    "/me",
    response_model=UserRead,
    summary="Update current user profile",
)
async def update_me(
    body: UserUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    await db.flush()
    await db.refresh(user)
    return user


# ── DELETE /auth/me ───────────────────────────────────────────────────
@router.delete(
    "/me",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete current user account",
    description="Permanently deletes the user and all associated data. This action is irreversible.",
)
async def delete_me(
    response: Response,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    await service.delete_account(user.id)
    _clear_refresh_cookie(response)
    return None

# SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
