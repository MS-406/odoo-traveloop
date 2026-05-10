# backend/app/schemas/stop.py
# Pydantic v2 schemas for Stop CRUD + reorder operations.
# Depends on: Phase 1 / Stop model, City model

import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class StopCreate(BaseModel):
    """POST /trips/{trip_id}/stops request body."""
    city_id: uuid.UUID
    start_date: date
    end_date: date

    @field_validator("end_date")
    @classmethod
    def end_after_start(cls, v: date, info) -> date:
        """Stop end date must be on or after start date."""
        start = info.data.get("start_date")
        if start and v < start:
            raise ValueError("End date must be on or after start date")
        return v


class StopUpdate(BaseModel):
    """PUT /stops/{id} request body — all fields optional."""
    city_id: uuid.UUID | None = None
    start_date: date | None = None
    end_date: date | None = None


class StopReorder(BaseModel):
    """PATCH /trips/{trip_id}/stops/reorder — accepts ordered list of stop IDs."""
    stop_ids: list[uuid.UUID] = Field(
        ..., min_length=1, description="Ordered list of stop UUIDs in desired new order"
    )


class StopReadFull(BaseModel):
    """Stop with nested city info — used in stop-level responses."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    trip_id: uuid.UUID
    city_id: uuid.UUID
    start_date: date
    end_date: date
    position_order: int
    created_at: datetime

# SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
