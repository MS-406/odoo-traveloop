# backend/app/routers/trips.py
# Trip CRUD router — paginated list, create, read, update, delete, copy.
# Depends on: Phase 1 / Trip model
# Depends on: Phase 2 / auth dependencies
# Depends on: Phase 3 / trip_service, trip schemas

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.trip import (
    PaginatedTrips,
    TripCreate,
    TripListItem,
    TripRead,
    TripUpdate,
)
from app.services.trip_service import TripService

router = APIRouter(prefix="/trips", tags=["trips"])


# ── GET /trips ────────────────────────────────────────────────────────
@router.get(
    "",
    response_model=PaginatedTrips,
    summary="List user's trips (paginated)",
    description="Returns paginated list of trips belonging to the authenticated user.",
)
async def list_trips(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=50, description="Items per page"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TripService(db)
    trips, total = await service.list_trips(user.id, page, limit)

    # Convert ORM objects to list items with stop_count
    items = [
        TripListItem(
            **{
                c.key: getattr(t, c.key)
                for c in t.__table__.columns
            },
            stop_count=len(t.stops),
        )
        for t in trips
    ]
    return PaginatedTrips.build(items=items, total=total, page=page, limit=limit)


# ── POST /trips ───────────────────────────────────────────────────────
@router.post(
    "",
    response_model=TripRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new trip",
)
async def create_trip(
    body: TripCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TripService(db)
    trip = await service.create_trip(
        user_id=user.id,
        name=body.name,
        description=body.description,
        start_date=body.start_date,
        end_date=body.end_date,
        cover_photo=body.cover_photo,
        is_public=body.is_public,
    )
    return trip


# ── GET /trips/{id} ──────────────────────────────────────────────────
@router.get(
    "/{trip_id}",
    response_model=TripRead,
    summary="Get trip details with stops",
)
async def get_trip(
    trip_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    import uuid as _uuid
    try:
        tid = _uuid.UUID(trip_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid trip ID format")

    service = TripService(db)
    trip = await service.get_trip(tid, user.id)
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found",
        )
    return trip


# ── PUT /trips/{id} ──────────────────────────────────────────────────
@router.put(
    "/{trip_id}",
    response_model=TripRead,
    summary="Update a trip",
)
async def update_trip(
    trip_id: str,
    body: TripUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    import uuid as _uuid
    try:
        tid = _uuid.UUID(trip_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid trip ID format")

    service = TripService(db)
    trip = await service.update_trip(tid, user.id, body.model_dump(exclude_unset=True))
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found",
        )
    return trip


# ── DELETE /trips/{id} ───────────────────────────────────────────────
@router.delete(
    "/{trip_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a trip",
)
async def delete_trip(
    trip_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    import uuid as _uuid
    try:
        tid = _uuid.UUID(trip_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid trip ID format")

    service = TripService(db)
    deleted = await service.delete_trip(tid, user.id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found",
        )
    return None


# ── POST /trips/{id}/copy ────────────────────────────────────────────
@router.post(
    "/{trip_id}/copy",
    response_model=TripRead,
    status_code=status.HTTP_201_CREATED,
    summary="Copy a trip (own or public)",
)
async def copy_trip(
    trip_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    import uuid as _uuid
    try:
        tid = _uuid.UUID(trip_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid trip ID format")

    service = TripService(db)
    new_trip = await service.copy_trip(tid, user.id)
    if not new_trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found or not accessible",
        )
    return new_trip

# SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated ✓ | error handled ✓
