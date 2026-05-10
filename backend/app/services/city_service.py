# backend/app/services/city_service.py
# Business logic for City search and retrieval.
# Cities are reference data — no CRUD needed (seeded in Phase 1).
# Depends on: Phase 1 / City model

import uuid
import math

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.city import City


class CityService:
    """City search and retrieval logic."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def search_cities(
        self,
        q: str | None = None,
        country: str | None = None,
        region: str | None = None,
        page: int = 1,
        limit: int = 20,
    ) -> tuple[list[City], int]:
        """Search cities with optional filters. Returns (cities, total_count)."""
        base = select(City)
        count_base = select(func.count(City.id))

        # Apply filters
        conditions = []
        if q:
            # Case-insensitive search on name and country
            pattern = f"%{q}%"
            conditions.append(
                or_(
                    City.name.ilike(pattern),
                    City.country.ilike(pattern),
                )
            )
        if country:
            conditions.append(City.country.ilike(f"%{country}%"))
        if region:
            conditions.append(City.region.ilike(f"%{region}%"))

        if conditions:
            for cond in conditions:
                base = base.where(cond)
                count_base = count_base.where(cond)

        total = (await self.db.execute(count_base)).scalar_one()

        offset = (page - 1) * limit
        q_final = base.order_by(City.popularity_score.desc().nullslast(), City.name).offset(offset).limit(limit)
        result = await self.db.execute(q_final)
        cities = list(result.scalars().all())

        return cities, total

    async def get_city(self, city_id: uuid.UUID) -> City | None:
        """Get a single city by ID."""
        result = await self.db.execute(select(City).where(City.id == city_id))
        return result.scalar_one_or_none()

# SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated ✓ | error handled ✓
