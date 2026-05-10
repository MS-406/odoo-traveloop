# backend/app/routers/activities.py
# Activity search + stop-activity attach/detach router.
# Search is public; attach/detach requires auth.
# Depends on: Phase 1 / Activity, StopActivity models
# Depends on: Phase 2 / auth dependencies
# Depends on: Phase 4 / activity_service, activity schemas

import uuid as _uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.activity import (
    ActivityRead,
    PaginatedActivities,
    StopActivityCreate,
    StopActivityRead,
)
from app.services.activity_service import ActivityService

router = APIRouter(tags=["activities"])


# ── GET /activities ──────────────────────────────────────────────────
@router.get(
    "/activities",
    response_model=PaginatedActivities,
    summary="Search activities (paginated)",
    description="Search and filter activities by type, max cost, and city. No auth required.",
)
async def list_activities(
    type: str | None = Query(None, description="Filter by activity type"),
    max_cost: float | None = Query(None, ge=0, description="Maximum cost filter"),
    city_id: str | None = Query(None, description="Filter by city UUID"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    # Parse city_id if provided
    cid = None
    if city_id:
        try:
            cid = _uuid.UUID(city_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid city_id format")

    service = ActivityService(db)
    activities, total = await service.search_activities(
        activity_type=type, max_cost=max_cost, city_id=cid, page=page, limit=limit
    )
    items = [ActivityRead.model_validate(a) for a in activities]
    return PaginatedActivities.build(items=items, total=total, page=page, limit=limit)


# ── GET /activities/{id} ─────────────────────────────────────────────
@router.get(
    "/activities/{activity_id}",
    response_model=ActivityRead,
    summary="Get activity details",
)
async def get_activity(
    activity_id: str,
    db: AsyncSession = Depends(get_db),
):
    try:
        aid = _uuid.UUID(activity_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid activity ID format")

    service = ActivityService(db)
    activity = await service.get_activity(aid)
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    return activity


# ── POST /stops/{stop_id}/activities ─────────────────────────────────
@router.post(
    "/stops/{stop_id}/activities",
    response_model=StopActivityRead,
    status_code=status.HTTP_201_CREATED,
    summary="Attach an activity to a stop",
)
async def attach_activity(
    stop_id: str,
    body: StopActivityCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        sid = _uuid.UUID(stop_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid stop ID format")

    service = ActivityService(db)
    try:
        sa = await service.attach_activity(
            stop_id=sid,
            user_id=user.id,
            activity_id=body.activity_id,
            scheduled_time=body.scheduled_time,
            custom_note=body.custom_note,
        )
    except ValueError as e:
        code = str(e)
        if code == "ACTIVITY_NOT_FOUND":
            raise HTTPException(status_code=404, detail="Activity not found")
        if code == "ACTIVITY_ALREADY_ATTACHED":
            raise HTTPException(status_code=409, detail="Activity already attached to this stop")
        raise

    if not sa:
        raise HTTPException(status_code=404, detail="Stop not found")
    return sa


# ── DELETE /stop_activities/{id} ─────────────────────────────────────
@router.delete(
    "/stop_activities/{stop_activity_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Detach an activity from a stop",
)
async def detach_activity(
    stop_activity_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        said = _uuid.UUID(stop_activity_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid stop_activity ID format")

    service = ActivityService(db)
    removed = await service.detach_activity(said, user.id)
    if not removed:
        raise HTTPException(status_code=404, detail="Stop activity not found")
    return None

# SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated ✓ | error handled ✓
