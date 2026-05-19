# backend/app/routers/cities.py
# City search and detail router — public endpoints (no auth required).
# Depends on: Phase 1 / City model
# Depends on: Phase 4 / city_service, city schemas

import uuid as _uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.city import CityRead, PaginatedCities
from app.services.city_service import CityService
from app.utils.cache import cache_get, cache_set, make_key

router = APIRouter(prefix="/cities", tags=["cities"])


# ── GET /cities ──────────────────────────────────────────────────────
@router.get(
    "",
    response_model=PaginatedCities,
    summary="Search cities (paginated)",
    description="Search and filter cities. No authentication required.",
)
async def list_cities(
    q: str | None = Query(None, description="Search by name or country"),
    country: str | None = Query(None, description="Filter by country"),
    region: str | None = Query(None, description="Filter by region"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    # Cache key encodes all filter params so each unique query is cached independently
    cache_params = {"q": q, "country": country, "region": region, "page": page, "limit": limit}
    key = make_key("cities_list", cache_params)
    cached = cache_get(key)
    if cached is not None:
        return cached

    service = CityService(db)
    cities, total = await service.search_cities(
        q=q, country=country, region=region, page=page, limit=limit
    )
    items = [CityRead.model_validate(c) for c in cities]
    result = PaginatedCities.build(items=items, total=total, page=page, limit=limit)
    cache_set(key, result, ttl_seconds=600)  # Cache for 10 minutes
    return result


# ── GET /cities/{id} ─────────────────────────────────────────────────
@router.get(
    "/{city_id}",
    response_model=CityRead,
    summary="Get city details",
)
async def get_city(
    city_id: str,
    db: AsyncSession = Depends(get_db),
):
    try:
        cid = _uuid.UUID(city_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid city ID format")

    key = make_key("city_detail", {"id": city_id})
    cached = cache_get(key)
    if cached is not None:
        return cached

    service = CityService(db)
    city = await service.get_city(cid)
    if not city:
        raise HTTPException(status_code=404, detail="City not found")

    result = CityRead.model_validate(city)
    cache_set(key, result, ttl_seconds=1800)  # Cache for 30 minutes
    return result

# SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated ✓ | error handled ✓
