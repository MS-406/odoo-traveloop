# backend/app/schemas/auth.py
# Pydantic v2 schemas for authentication endpoints (signup, login, token responses).
# Validation rules match frontend Zod schemas for consistency.
# Depends on: Phase 2 / schemas/user.py

import uuid
import re

from pydantic import BaseModel, EmailStr, Field, field_validator


class SignupRequest(BaseModel):
    """POST /auth/signup request body."""
    email: EmailStr = Field(..., max_length=255)
    password: str = Field(..., min_length=8, max_length=128)
    full_name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        pattern=r"^[a-zA-Z\s]+$",  # No special chars
    )

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        """Enforce: 1 uppercase, 1 digit, 1 special char — matches frontend Zod rule."""
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one number")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character")
        return v


class LoginRequest(BaseModel):
    """POST /auth/login request body."""
    email: EmailStr = Field(..., max_length=255)
    password: str = Field(..., min_length=1)


class TokenResponse(BaseModel):
    """Returned by login and refresh — contains the access token."""
    access_token: str
    token_type: str = "bearer"


class MessageResponse(BaseModel):
    """Generic message response for logout, delete, etc."""
    detail: str

# SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
