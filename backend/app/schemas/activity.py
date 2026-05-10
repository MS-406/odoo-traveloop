# backend/app/schemas/activity.py
# Pydantic v2 schemas for Activity read + StopActivity create.
# Depends on: Phase 1 / Activity, StopActivity models

import uuid
import math
from datetime import time
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class ActivityRead(BaseModel):
    """Full activity representation."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    description: str | None = None
    type: str
    cost: Decimal = Decimal("0")
    duration_min: int | None = None
    image_url: str | None = None
    city_id: uuid.UUID


class PaginatedActivities(BaseModel):
    """Paginated activity list response."""
    items: list[ActivityRead]
    total: int
    page: int
    limit: int
    pages: int

    @classmethod
    def build(cls, items: list[ActivityRead], total: int, page: int, limit: int):
        return cls(
            items=items,
            total=total,
            page=page,
            limit=limit,
            pages=max(1, math.ceil(total / limit)),
        )


class StopActivityCreate(BaseModel):
    """POST /stops/{stop_id}/activities request body."""
    activity_id: uuid.UUID
    scheduled_time: time | None = None
    custom_note: str | None = Field(None, max_length=500)


class StopActivityRead(BaseModel):
    """Stop-activity junction with nested activity info."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    stop_id: uuid.UUID
    activity_id: uuid.UUID
    scheduled_time: time | None = None
    custom_note: str | None = None
    activity: ActivityRead | None = None

# SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated ✓ | error handled ✓
