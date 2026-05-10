# backend/app/services/activity_service.py
# Business logic for Activity search + attach/detach from stops.
# Depends on: Phase 1 / Activity, StopActivity, Stop, Trip models
# Depends on: Phase 3 / stop ownership pattern

import uuid
import math

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.activity import Activity
from app.models.stop_activity import StopActivity
from app.models.stop import Stop
from app.models.trip import Trip


class ActivityService:
    """Activity search and stop-activity junction management."""

    def __init__(self, db: AsyncSession):
        self.db = db

    # ── Search activities ────────────────────────────────────────────
    async def search_activities(
        self,
        activity_type: str | None = None,
        max_cost: float | None = None,
        city_id: uuid.UUID | None = None,
        page: int = 1,
        limit: int = 20,
    ) -> tuple[list[Activity], int]:
        """Search activities with optional filters. Returns (activities, total)."""
        base = select(Activity)
        count_base = select(func.count(Activity.id))

        if activity_type:
            base = base.where(Activity.type == activity_type)
            count_base = count_base.where(Activity.type == activity_type)
        if max_cost is not None:
            base = base.where(Activity.cost <= max_cost)
            count_base = count_base.where(Activity.cost <= max_cost)
        if city_id:
            base = base.where(Activity.city_id == city_id)
            count_base = count_base.where(Activity.city_id == city_id)

        total = (await self.db.execute(count_base)).scalar_one()

        offset = (page - 1) * limit
        q = base.order_by(Activity.name).offset(offset).limit(limit)
        result = await self.db.execute(q)
        activities = list(result.scalars().all())

        return activities, total

    # ── Get single activity ──────────────────────────────────────────
    async def get_activity(self, activity_id: uuid.UUID) -> Activity | None:
        result = await self.db.execute(
            select(Activity).where(Activity.id == activity_id)
        )
        return result.scalar_one_or_none()

    # ── Attach activity to stop ──────────────────────────────────────
    async def attach_activity(
        self,
        stop_id: uuid.UUID,
        user_id: uuid.UUID,
        activity_id: uuid.UUID,
        scheduled_time=None,
        custom_note: str | None = None,
    ) -> StopActivity | None:
        """Attach an activity to a stop. Returns None if stop not found/not owned."""
        # Verify stop ownership via trip
        stop = await self._get_owned_stop(stop_id, user_id)
        if not stop:
            return None

        # Verify activity exists
        activity = await self.get_activity(activity_id)
        if not activity:
            raise ValueError("ACTIVITY_NOT_FOUND")

        # Check for duplicate
        existing = await self.db.execute(
            select(StopActivity).where(
                StopActivity.stop_id == stop_id,
                StopActivity.activity_id == activity_id,
            )
        )
        if existing.scalar_one_or_none():
            raise ValueError("ACTIVITY_ALREADY_ATTACHED")

        sa = StopActivity(
            stop_id=stop_id,
            activity_id=activity_id,
            scheduled_time=scheduled_time,
            custom_note=custom_note,
        )
        self.db.add(sa)
        await self.db.flush()
        # Load activity relationship for response
        await self.db.refresh(sa, ["activity"])
        return sa

    # ── Detach activity from stop ────────────────────────────────────
    async def detach_activity(
        self, stop_activity_id: uuid.UUID, user_id: uuid.UUID
    ) -> bool:
        """Remove a stop-activity link. Returns True if removed."""
        result = await self.db.execute(
            select(StopActivity)
            .join(Stop)
            .join(Trip)
            .where(StopActivity.id == stop_activity_id, Trip.user_id == user_id)
        )
        sa = result.scalar_one_or_none()
        if not sa:
            return False
        await self.db.delete(sa)
        return True

    # ── Helper ───────────────────────────────────────────────────────
    async def _get_owned_stop(
        self, stop_id: uuid.UUID, user_id: uuid.UUID
    ) -> Stop | None:
        result = await self.db.execute(
            select(Stop).join(Trip).where(Stop.id == stop_id, Trip.user_id == user_id)
        )
        return result.scalar_one_or_none()

# SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated ✓ | error handled ✓
