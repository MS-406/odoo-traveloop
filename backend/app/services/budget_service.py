# backend/app/services/budget_service.py
# Business logic for trip budget computation.
# Budget = sum of all activity costs across all stop_activities for a trip.
# Depends on: Phase 1 / Trip, Stop, StopActivity, Activity models
# Depends on: Phase 3 / trip ownership

import uuid
from collections import defaultdict
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.trip import Trip
from app.models.stop import Stop
from app.models.stop_activity import StopActivity
from app.models.activity import Activity


class BudgetService:
    """Computes trip budget from stop_activities + activity costs."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def compute_budget(
        self, trip_id: uuid.UUID, user_id: uuid.UUID
    ) -> dict | None:
        """Compute full budget summary for a trip.

        Returns None if trip not found/not owned.
        Returns dict matching BudgetSummary schema.
        """
        # Fetch trip with stops → stop_activities → activities
        q = (
            select(Trip)
            .where(Trip.id == trip_id, Trip.user_id == user_id)
            .options(
                selectinload(Trip.stops)
                .selectinload(Stop.stop_activities)
                .selectinload(StopActivity.activity)
            )
        )
        result = await self.db.execute(q)
        trip = result.scalar_one_or_none()
        if not trip:
            return None

        # Also load city on each stop for stop names
        for stop in trip.stops:
            await self.db.refresh(stop, ["city"])

        # Compute totals
        total = Decimal("0")
        category_totals: dict[str, Decimal] = defaultdict(Decimal)
        category_counts: dict[str, int] = defaultdict(int)
        stop_breakdown = []

        for stop in trip.stops:
            stop_total = Decimal("0")
            stop_activity_count = 0

            for sa in stop.stop_activities:
                activity = sa.activity
                if activity:
                    cost = Decimal(str(activity.cost))
                    total += cost
                    stop_total += cost
                    stop_activity_count += 1
                    category_totals[activity.type] += cost
                    category_counts[activity.type] += 1

            stop_breakdown.append({
                "stop_id": str(stop.id),
                "city_name": stop.city.name if stop.city else "Unknown",
                "total_cost": stop_total,
                "activity_count": stop_activity_count,
            })

        # Duration in days (min 1)
        duration = max(1, (trip.end_date - trip.start_date).days + 1)
        cost_per_day = total / duration if duration > 0 else Decimal("0")

        # Category breakdown with percentages
        categories = []
        for cat, cat_total in sorted(category_totals.items()):
            pct = float(cat_total / total * 100) if total > 0 else 0.0
            categories.append({
                "category": cat,
                "total_cost": cat_total,
                "activity_count": category_counts[cat],
                "percentage": round(pct, 1),
            })

        return {
            "trip_id": str(trip.id),
            "trip_name": trip.name,
            "total_budget": total,
            "cost_per_day": round(cost_per_day, 2),
            "trip_duration_days": duration,
            "category_breakdown": categories,
            "stop_breakdown": stop_breakdown,
        }

# SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
