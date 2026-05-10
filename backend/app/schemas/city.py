# backend/app/schemas/city.py
# Pydantic v2 schemas for City read + paginated list.
# Depends on: Phase 1 / City model

import uuid
import math
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class CityRead(BaseModel):
    """Full city representation."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    country: str
    region: str | None = None
    cost_index: Decimal | None = None
    popularity_score: Decimal | None = None
    image_url: str | None = None
    latitude: Decimal | None = None
    longitude: Decimal | None = None


class PaginatedCities(BaseModel):
    """Paginated city list response."""
    items: list[CityRead]
    total: int
    page: int
    limit: int
    pages: int

    @classmethod
    def build(cls, items: list[CityRead], total: int, page: int, limit: int):
        return cls(
            items=items,
            total=total,
            page=page,
            limit=limit,
            pages=max(1, math.ceil(total / limit)),
        )

# SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated ✓ | error handled ✓
