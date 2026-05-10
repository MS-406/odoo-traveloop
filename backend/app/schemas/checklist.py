# backend/app/schemas/checklist.py
# Pydantic v2 schemas for ChecklistItem CRUD.
# Depends on: Phase 1 / ChecklistItem model

import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, field_validator

VALID_CATEGORIES = ("clothing", "documents", "electronics", "toiletries", "medicine", "other")


class ChecklistCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    category: str = Field(..., min_length=1)

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        if v not in VALID_CATEGORIES:
            raise ValueError(f"Category must be one of: {', '.join(VALID_CATEGORIES)}")
        return v


class ChecklistUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=200)
    category: str | None = None
    is_packed: bool | None = None

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str | None) -> str | None:
        if v is not None and v not in VALID_CATEGORIES:
            raise ValueError(f"Category must be one of: {', '.join(VALID_CATEGORIES)}")
        return v


class ChecklistRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    trip_id: uuid.UUID
    name: str
    category: str
    is_packed: bool
    created_at: datetime

# SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
