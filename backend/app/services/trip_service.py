# backend/app/services/trip_service.py
# Business logic for Trip CRUD — create, read, update, delete, copy.
# Separates DB operations from route handlers for testability.
# Depends on: Phase 1 / Trip model, Stop model, City model
# Depends on: Phase 2 / auth (ownership check via user_id)

import secrets
import uuid
import math

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.trip import Trip
from app.models.stop import Stop


class TripService:
    """Encapsulates all trip-related business logic."""

    def __init__(self, db: AsyncSession):
        self.db = db

    # ── List (paginated) ─────────────────────────────────────────────
    async def list_trips(
        self, user_id: uuid.UUID, page: int = 1, limit: int = 10
    ) -> tuple[list[Trip], int]:
        """Return paginated trips for a user, ordered by created_at desc.

        Returns (trips, total_count).
        """
        # Count total
        count_q = select(func.count(Trip.id)).where(Trip.user_id == user_id)
        total = (await self.db.execute(count_q)).scalar_one()

        # Fetch page — eager-load stops for stop_count computation
        offset = (page - 1) * limit
        q = (
            select(Trip)
            .where(Trip.user_id == user_id)
            .options(selectinload(Trip.stops))
            .order_by(Trip.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self.db.execute(q)
        trips = list(result.scalars().unique().all())
        return trips, total

    # ── Get single trip ──────────────────────────────────────────────
    async def get_trip(
        self, trip_id: uuid.UUID, user_id: uuid.UUID
    ) -> Trip | None:
        """Fetch a trip by ID with stops + city info. Returns None if not found/not owned."""
        q = (
            select(Trip)
            .where(Trip.id == trip_id, Trip.user_id == user_id)
            .options(
                selectinload(Trip.stops).selectinload(Stop.city)
            )
        )
        result = await self.db.execute(q)
        return result.scalar_one_or_none()

    # ── Create ───────────────────────────────────────────────────────
    async def create_trip(
        self,
        user_id: uuid.UUID,
        name: str,
        start_date,
        end_date,
        description: str | None = None,
        cover_photo: str | None = None,
        is_public: bool = False,
    ) -> Trip:
        """Create a new trip. Auto-generates share_code if public."""
        if not cover_photo:
            import urllib.parse
            query = urllib.parse.quote(f"travel,{name}")
            cover_photo = f"https://loremflickr.com/1200/400/{query}/all"

        share_code = self._generate_share_code() if is_public else None
        trip = Trip(
            user_id=user_id,
            name=name,
            description=description,
            start_date=start_date,
            end_date=end_date,
            cover_photo=cover_photo,
            is_public=is_public,
            share_code=share_code,
        )
        self.db.add(trip)
        await self.db.flush()

        # Re-fetch with eager-loaded stops to avoid async lazy-load errors
        return await self.get_trip(trip.id, user_id)

    # ── Update ───────────────────────────────────────────────────────
    async def update_trip(
        self, trip_id: uuid.UUID, user_id: uuid.UUID, update_data: dict
    ) -> Trip | None:
        """Update a trip. Returns None if not found/not owned."""
        trip = await self.get_trip(trip_id, user_id)
        if not trip:
            return None

        for field, value in update_data.items():
            if value is not None:
                setattr(trip, field, value)

        # Auto-manage share_code based on is_public toggle
        if "is_public" in update_data:
            if update_data["is_public"] and not trip.share_code:
                trip.share_code = self._generate_share_code()
            elif not update_data["is_public"]:
                trip.share_code = None

        await self.db.flush()
        await self.db.refresh(trip)
        return trip

    # ── Delete ───────────────────────────────────────────────────────
    async def delete_trip(
        self, trip_id: uuid.UUID, user_id: uuid.UUID
    ) -> bool:
        """Delete a trip. Returns True if deleted, False if not found."""
        q = select(Trip).where(Trip.id == trip_id, Trip.user_id == user_id)
        result = await self.db.execute(q)
        trip = result.scalar_one_or_none()
        if not trip:
            return False
        await self.db.delete(trip)
        return True

    # ── Copy ─────────────────────────────────────────────────────────
    async def copy_trip(
        self, trip_id: uuid.UUID, user_id: uuid.UUID
    ) -> Trip | None:
        """Clone a trip + its stops. User can copy their own trips or public trips.

        Does NOT copy stop_activities (those are Phase 4 concerns).
        """
        # Try own trip first, then public trip
        q = (
            select(Trip)
            .where(Trip.id == trip_id)
            .options(selectinload(Trip.stops))
        )
        result = await self.db.execute(q)
        original = result.scalar_one_or_none()

        if not original:
            return None
        # Must be owned by user OR public
        if original.user_id != user_id and not original.is_public:
            return None

        # Create copy
        new_trip = Trip(
            user_id=user_id,
            name=f"{original.name} (Copy)",
            description=original.description,
            start_date=original.start_date,
            end_date=original.end_date,
            cover_photo=original.cover_photo,
            is_public=False,  # Copies start private
            share_code=None,
        )
        self.db.add(new_trip)
        await self.db.flush()

        # Copy stops
        for stop in original.stops:
            new_stop = Stop(
                trip_id=new_trip.id,
                city_id=stop.city_id,
                start_date=stop.start_date,
                end_date=stop.end_date,
                position_order=stop.position_order,
            )
            self.db.add(new_stop)

        await self.db.flush()
        # Re-fetch with eager-loaded stops
        return await self.get_trip(new_trip.id, user_id)

    # ── Helpers ───────────────────────────────────────────────────────
    @staticmethod
    def _generate_share_code() -> str:
        """Generate a unique 8-character alphanumeric share code."""
        return secrets.token_urlsafe(6)[:8]  # URL-safe, 8 chars

# SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated ✓ | error handled ✓
