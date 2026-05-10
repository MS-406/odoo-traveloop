# backend/app/services/stop_service.py
# Business logic for Stop CRUD + reorder within a trip.
# Depends on: Phase 1 / Stop model, Trip model, City model
# Depends on: Phase 2 / auth (ownership enforced by trip ownership)

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.stop import Stop
from app.models.trip import Trip
from app.models.city import City


class StopService:
    """Encapsulates all stop-related business logic."""

    def __init__(self, db: AsyncSession):
        self.db = db

    # ── Create ───────────────────────────────────────────────────────
    async def create_stop(
        self,
        trip_id: uuid.UUID,
        user_id: uuid.UUID,
        city_id: uuid.UUID,
        start_date,
        end_date,
    ) -> Stop | None:
        """Add a stop to a trip. Returns None if trip not found/not owned or city invalid."""
        # Verify trip ownership
        trip = await self._get_owned_trip(trip_id, user_id)
        if not trip:
            return None

        # Verify city exists
        city_result = await self.db.execute(select(City).where(City.id == city_id))
        if not city_result.scalar_one_or_none():
            raise ValueError("CITY_NOT_FOUND")

        # Calculate next position_order
        max_pos = await self.db.execute(
            select(func.coalesce(func.max(Stop.position_order), -1))
            .where(Stop.trip_id == trip_id)
        )
        next_pos = max_pos.scalar_one() + 1

        stop = Stop(
            trip_id=trip_id,
            city_id=city_id,
            start_date=start_date,
            end_date=end_date,
            position_order=next_pos,
        )
        self.db.add(stop)
        await self.db.flush()

        # Load city relationship for response
        await self.db.refresh(stop, ["city"])
        return stop

    # ── Update ───────────────────────────────────────────────────────
    async def update_stop(
        self, stop_id: uuid.UUID, user_id: uuid.UUID, update_data: dict
    ) -> Stop | None:
        """Update a stop. Returns None if not found or trip not owned."""
        stop = await self._get_owned_stop(stop_id, user_id)
        if not stop:
            return None

        # If city_id is changing, verify new city exists
        if "city_id" in update_data and update_data["city_id"]:
            city_result = await self.db.execute(
                select(City).where(City.id == update_data["city_id"])
            )
            if not city_result.scalar_one_or_none():
                raise ValueError("CITY_NOT_FOUND")

        for field, value in update_data.items():
            if value is not None:
                setattr(stop, field, value)

        await self.db.flush()
        await self.db.refresh(stop, ["city"])
        return stop

    # ── Delete ───────────────────────────────────────────────────────
    async def delete_stop(
        self, stop_id: uuid.UUID, user_id: uuid.UUID
    ) -> bool:
        """Delete a stop. Returns True if deleted."""
        stop = await self._get_owned_stop(stop_id, user_id)
        if not stop:
            return False
        await self.db.delete(stop)
        return True

    # ── Reorder ──────────────────────────────────────────────────────
    async def reorder_stops(
        self, trip_id: uuid.UUID, user_id: uuid.UUID, stop_ids: list[uuid.UUID]
    ) -> list[Stop]:
        """Reorder stops by assigning new position_order based on list order.

        Returns the reordered stops list.
        """
        trip = await self._get_owned_trip(trip_id, user_id)
        if not trip:
            raise ValueError("TRIP_NOT_FOUND")

        # Fetch all stops for this trip
        result = await self.db.execute(
            select(Stop)
            .where(Stop.trip_id == trip_id)
            .options(selectinload(Stop.city))
        )
        stops = {s.id: s for s in result.scalars().all()}

        # Validate all provided stop_ids belong to this trip
        if set(stop_ids) != set(stops.keys()):
            raise ValueError("STOP_IDS_MISMATCH")

        # Assign new positions
        for idx, sid in enumerate(stop_ids):
            stops[sid].position_order = idx

        await self.db.flush()
        return [stops[sid] for sid in stop_ids]

    # ── Helpers ──────────────────────────────────────────────────────
    async def _get_owned_trip(
        self, trip_id: uuid.UUID, user_id: uuid.UUID
    ) -> Trip | None:
        """Fetch a trip only if owned by the given user."""
        result = await self.db.execute(
            select(Trip).where(Trip.id == trip_id, Trip.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def _get_owned_stop(
        self, stop_id: uuid.UUID, user_id: uuid.UUID
    ) -> Stop | None:
        """Fetch a stop only if its parent trip is owned by the given user."""
        result = await self.db.execute(
            select(Stop)
            .join(Trip)
            .where(Stop.id == stop_id, Trip.user_id == user_id)
        )
        return result.scalar_one_or_none()

# SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
