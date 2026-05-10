# backend/app/routers/stops.py
# Stop CRUD + reorder router.
# Depends on: Phase 1 / Stop model
# Depends on: Phase 2 / auth dependencies
# Depends on: Phase 3 / stop_service, stop schemas, trip schemas

import uuid as _uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.stop import StopCreate, StopReorder, StopUpdate
from app.schemas.trip import StopRead
from app.services.stop_service import StopService

router = APIRouter(tags=["stops"])


# ── POST /trips/{trip_id}/stops ──────────────────────────────────────
@router.post(
    "/trips/{trip_id}/stops",
    response_model=StopRead,
    status_code=status.HTTP_201_CREATED,
    summary="Add a stop to a trip",
)
async def create_stop(
    trip_id: str,
    body: StopCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        tid = _uuid.UUID(trip_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid trip ID format")

    service = StopService(db)
    try:
        stop = await service.create_stop(
            trip_id=tid,
            user_id=user.id,
            city_id=body.city_id,
            start_date=body.start_date,
            end_date=body.end_date,
        )
    except ValueError as e:
        if str(e) == "CITY_NOT_FOUND":
            raise HTTPException(status_code=404, detail="City not found")
        raise

    if not stop:
        raise HTTPException(status_code=404, detail="Trip not found")
    return stop


# ── PUT /stops/{id} ──────────────────────────────────────────────────
@router.put(
    "/stops/{stop_id}",
    response_model=StopRead,
    summary="Update a stop",
)
async def update_stop(
    stop_id: str,
    body: StopUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        sid = _uuid.UUID(stop_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid stop ID format")

    service = StopService(db)
    try:
        stop = await service.update_stop(sid, user.id, body.model_dump(exclude_unset=True))
    except ValueError as e:
        if str(e) == "CITY_NOT_FOUND":
            raise HTTPException(status_code=404, detail="City not found")
        raise

    if not stop:
        raise HTTPException(status_code=404, detail="Stop not found")
    return stop


# ── DELETE /stops/{id} ───────────────────────────────────────────────
@router.delete(
    "/stops/{stop_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a stop",
)
async def delete_stop(
    stop_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        sid = _uuid.UUID(stop_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid stop ID format")

    service = StopService(db)
    deleted = await service.delete_stop(sid, user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Stop not found")
    return None


# ── PATCH /trips/{trip_id}/stops/reorder ─────────────────────────────
@router.patch(
    "/trips/{trip_id}/stops/reorder",
    response_model=list[StopRead],
    summary="Reorder stops in a trip",
    description="Accepts an ordered list of stop UUIDs. Assigns new position_order values.",
)
async def reorder_stops(
    trip_id: str,
    body: StopReorder,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        tid = _uuid.UUID(trip_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid trip ID format")

    service = StopService(db)
    try:
        stops = await service.reorder_stops(tid, user.id, body.stop_ids)
    except ValueError as e:
        code = str(e)
        if code == "TRIP_NOT_FOUND":
            raise HTTPException(status_code=404, detail="Trip not found")
        if code == "STOP_IDS_MISMATCH":
            raise HTTPException(
                status_code=400,
                detail="Provided stop IDs do not match trip's stops",
            )
        raise

    return stops

# SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
