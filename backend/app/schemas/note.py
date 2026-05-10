# backend/app/schemas/note.py
# Pydantic v2 schemas for Note CRUD.
# Depends on: Phase 1 / Note model

import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class NoteCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000)
    stop_id: uuid.UUID | None = None


class NoteUpdate(BaseModel):
    content: str | None = Field(None, min_length=1, max_length=5000)
    stop_id: uuid.UUID | None = None


class NoteRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    user_id: uuid.UUID
    trip_id: uuid.UUID
    stop_id: uuid.UUID | None = None
    content: str
    created_at: datetime
    updated_at: datetime

# SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
