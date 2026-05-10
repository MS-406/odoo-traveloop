# backend/app/schemas/trip.py
# Pydantic v2 schemas for Trip CRUD operations.
# Depends on: Phase 1 / Trip model, Phase 3 / stop schemas

import uuid
import math
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class TripCreate(BaseModel):
    """POST /trips request body."""
    name: str = Field(..., min_length=1, max_length=200)
    description: str | None = Field(None, max_length=2000)
    start_date: date
    end_date: date
    cover_photo: str | None = None
    is_public: bool = False

    @field_validator("end_date")
    @classmethod
    def end_after_start(cls, v: date, info) -> date:
        """End date must be on or after start date — validated both client and server."""
        start = info.data.get("start_date")
        if start and v < start:
            raise ValueError("End date must be on or after start date")
        return v


class TripUpdate(BaseModel):
    """PUT /trips/{id} request body — all fields optional."""
    name: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = Field(None, max_length=2000)
    start_date: date | None = None
    end_date: date | None = None
    cover_photo: str | None = None
    is_public: bool | None = None


# ── Nested city read for stop responses ──────────────────────────────
class CityBrief(BaseModel):
    """Minimal city info embedded in stop responses."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    country: str
    image_url: str | None = None


# ── Stop read (nested inside TripRead) ───────────────────────────────
class StopRead(BaseModel):
    """Stop representation returned inside trip detail responses."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    trip_id: uuid.UUID
    city_id: uuid.UUID
    city: CityBrief | None = None
    start_date: date
    end_date: date
    position_order: int
    created_at: datetime


class TripRead(BaseModel):
    """Full trip detail — includes stops list."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    description: str | None = None
    start_date: date
    end_date: date
    cover_photo: str | None = None
    is_public: bool
    share_code: str | None = None
    created_at: datetime
    updated_at: datetime
    stops: list[StopRead] = []


class TripListItem(BaseModel):
    """Lightweight trip for list views — no nested stops."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    description: str | None = None
    start_date: date
    end_date: date
    cover_photo: str | None = None
    is_public: bool
    share_code: str | None = None
    created_at: datetime
    updated_at: datetime
    stop_count: int = 0


class PaginatedTrips(BaseModel):
    """Paginated trip list response — spec format."""
    items: list[TripListItem]
    total: int
    page: int
    limit: int
    pages: int

    @classmethod
    def build(cls, items: list[TripListItem], total: int, page: int, limit: int):
        return cls(
            items=items,
            total=total,
            page=page,
            limit=limit,
            pages=max(1, math.ceil(total / limit)),
        )

# SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated ✓ | error handled ✓
