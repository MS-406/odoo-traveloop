# backend/app/schemas/collaborative.py
# Pydantic schemas for collaborative trip planning feature.

import uuid
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field


# ── Request Schemas ──────────────────────────────────────────────────

class CollabTripCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    description: Optional[str] = None


class CollabTripUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=200)
    description: Optional[str] = None
    status: Optional[str] = Field(None, pattern=r"^(planning|finalized|archived)$")


class CollabStopCreate(BaseModel):
    city_name: str = Field(..., min_length=1, max_length=100)
    country: Optional[str] = Field(None, max_length=100)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    notes: Optional[str] = None
    position_order: int = Field(default=0, ge=0)


class CollabStopUpdate(BaseModel):
    city_name: Optional[str] = Field(None, min_length=1, max_length=100)
    country: Optional[str] = Field(None, max_length=100)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    notes: Optional[str] = None
    position_order: Optional[int] = Field(None, ge=0)


class CollabVoteCreate(BaseModel):
    vote: str = Field(..., pattern=r"^(yes|no|maybe)$")


class CollabCommentCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)
    stop_id: Optional[uuid.UUID] = None


class CollabRoleUpdate(BaseModel):
    role: str = Field(..., pattern=r"^(editor|viewer)$")


# ── Response Schemas ─────────────────────────────────────────────────

class CollabMemberRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    role: str
    joined_at: datetime
    full_name: str
    email: str
    avatar_url: Optional[str] = None

    model_config = {"from_attributes": True}


class CollabVoteRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    vote: str
    full_name: str

    model_config = {"from_attributes": True}


class CollabStopRead(BaseModel):
    id: uuid.UUID
    trip_id: uuid.UUID
    city_name: str
    country: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    notes: Optional[str] = None
    added_by: Optional[uuid.UUID] = None
    added_by_name: Optional[str] = None
    position_order: int
    created_at: datetime
    votes: list[CollabVoteRead] = []
    vote_summary: dict[str, int] = {"yes": 0, "no": 0, "maybe": 0}

    model_config = {"from_attributes": True}


class CollabCommentRead(BaseModel):
    id: uuid.UUID
    trip_id: uuid.UUID
    stop_id: Optional[uuid.UUID] = None
    user_id: uuid.UUID
    content: str
    created_at: datetime
    full_name: str
    avatar_url: Optional[str] = None

    model_config = {"from_attributes": True}


class CollabTripRead(BaseModel):
    id: uuid.UUID
    title: str
    description: Optional[str] = None
    owner_id: uuid.UUID
    status: str
    invite_code: str
    created_at: datetime
    updated_at: datetime
    member_count: int = 0
    stop_count: int = 0
    my_role: Optional[str] = None

    model_config = {"from_attributes": True}


class CollabTripDetail(CollabTripRead):
    members: list[CollabMemberRead] = []
    stops: list[CollabStopRead] = []
    comments: list[CollabCommentRead] = []


class CollabPollResponse(BaseModel):
    updated_at: datetime
    member_count: int
    stop_count: int
    latest_comments: list[CollabCommentRead] = []
