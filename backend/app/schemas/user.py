# backend/app/schemas/user.py
# Pydantic v2 schemas for User read/update operations.
# Depends on: Phase 1 / User model

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserRead(BaseModel):
    """Public user representation — returned by GET /auth/me and other user endpoints."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    full_name: str
    avatar_url: str | None = None
    language: str = "en"
    is_admin: bool = False
    is_active: bool = True
    created_at: datetime
    updated_at: datetime


class UserUpdate(BaseModel):
    """Schema for PUT /auth/me — partial profile updates."""
    full_name: str | None = Field(
        None,
        min_length=2,
        max_length=100,
        pattern=r"^[a-zA-Z\s]+$",  # No special chars — matches frontend Zod rule
    )
    avatar_url: str | None = None
    language: str | None = Field(None, max_length=10)

# SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
