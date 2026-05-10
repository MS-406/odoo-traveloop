# backend/app/routers/ai_optimizer.py
# AI-powered trip optimizer using Claude API.
# New file — registered in main.py.

import json
import logging
import uuid as _uuid
from datetime import date
from typing import Literal

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import settings
from app.database import get_db
from app.dependencies import get_current_user
from app.models.city import City
from app.models.stop import Stop
from app.models.stop_activity import StopActivity
from app.models.trip import Trip
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["ai"])


# ── Request / Response Schemas ───────────────────────────────────────

class TripOptimizeRequest(BaseModel):
    starting_city: str = Field(..., min_length=2, max_length=100)
    destination_cities: list[str] = Field(..., min_length=1, max_length=10)
    travelers: int = Field(..., ge=1, le=20)
    budget_usd: float = Field(..., gt=0, le=1_000_000)
    transport_preference: Literal["flight", "train", "bus", "car", "mixed"]
    travel_style: Literal["budget", "medium", "luxury"]
    start_date: date
    end_date: date
    priority: Literal["cheapest", "fastest", "balanced", "scenic"]
    interests: list[str] = Field(default=[], max_length=10)


class RouteStop(BaseModel):
    order: int
    city: str
    country: str
    days_recommended: int
    estimated_cost_usd: float
    transport_from_previous: str
    transport_cost_usd: float
    transport_duration_hours: float
    best_activities: list[str]
    best_stay_type: str
    estimated_stay_cost_per_night: float
    local_tips: str


class BudgetBreakdown(BaseModel):
    transport: float
    accommodation: float
    activities: float
    meals: float


class OptimizationResult(BaseModel):
    optimized_route: list[RouteStop]
    total_estimated_cost_usd: float
    total_days: int
    savings_vs_unoptimized_pct: float
    optimization_summary: str
    budget_breakdown: BudgetBreakdown
    warnings: list[str]
    alternative_suggestion: str


class InsightCitySuggestion(BaseModel):
    id: _uuid.UUID
    name: str
    country: str
    region: str | None = None
    image_url: str | None = None
    reason: str


class TripInsightsResult(BaseModel):
    summary: str
    highlights: list[str]
    warnings: list[str]
    next_steps: list[str]
    suggested_cities: list[InsightCitySuggestion]


# ── Claude Prompt Builder ────────────────────────────────────────────

def _build_prompt(req: TripOptimizeRequest) -> str:
    destinations = ", ".join(req.destination_cities)
    interests = ", ".join(req.interests) if req.interests else "general sightseeing"

    return f"""You are an expert travel optimizer. Given this trip data, return ONLY a valid JSON object (no markdown, no explanation, no code fences) with this exact structure:

{{
  "optimized_route": [
    {{
      "order": 1,
      "city": "City Name",
      "country": "Country",
      "days_recommended": 3,
      "estimated_cost_usd": 450,
      "transport_from_previous": "flight",
      "transport_cost_usd": 120,
      "transport_duration_hours": 2.5,
      "best_activities": ["Activity 1", "Activity 2", "Activity 3"],
      "best_stay_type": "3-star hotel",
      "estimated_stay_cost_per_night": 60,
      "local_tips": "Tip about this city"
    }}
  ],
  "total_estimated_cost_usd": 2400,
  "total_days": 12,
  "savings_vs_unoptimized_pct": 18,
  "optimization_summary": "Brief explanation of why this route is optimal",
  "budget_breakdown": {{
    "transport": 600,
    "accommodation": 900,
    "activities": 450,
    "meals": 450
  }},
  "warnings": ["Any important warnings like visa requirements"],
  "alternative_suggestion": "One sentence suggesting an alternative if budget is tight"
}}

Trip data:
- Starting city: {req.starting_city}
- Destinations: {destinations}
- Travelers: {req.travelers}
- Total budget: ${req.budget_usd} USD
- Travel style: {req.travel_style}
- Transport preference: {req.transport_preference}
- Dates: {req.start_date} to {req.end_date}
- Priority: {req.priority}
- Interests: {interests}

Optimize for {req.priority}. Be realistic with costs for {req.travelers} traveler(s). All costs should be per-person. Return only the JSON object, nothing else."""


# ── Claude API Call ──────────────────────────────────────────────────

async def _call_claude(prompt: str, retry: bool = False) -> dict:
    """Call Claude API and return parsed JSON response."""
    api_key = getattr(settings, "ANTHROPIC_API_KEY", None)
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI optimization service not configured. Set ANTHROPIC_API_KEY in .env",
        )

    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }

    body = {
        "model": "claude-sonnet-4-20250514",
        "max_tokens": 4096,
        "messages": [{"role": "user", "content": prompt}],
    }

    if retry:
        body["messages"].append({
            "role": "assistant",
            "content": "{"
        })

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers=headers,
                json=body,
            )
            response.raise_for_status()
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI optimization service timed out. Please try again.",
        )
    except httpx.HTTPStatusError as e:
        logger.error(f"Claude API error: {e.response.status_code} - {e.response.text}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI optimization service unavailable",
        )

    try:
        data = response.json()
        content = data["content"][0]["text"]
        if retry:
            content = "{" + content

        # Strip any markdown code fences if present
        content = content.strip()
        if content.startswith("```"):
            content = content.split("\n", 1)[1]
        if content.endswith("```"):
            content = content.rsplit("```", 1)[0]
        content = content.strip()

        return json.loads(content)
    except (json.JSONDecodeError, KeyError, IndexError) as e:
        if not retry:
            logger.warning("JSON parse failed, retrying with stricter prompt")
            return await _call_claude(prompt, retry=True)
        logger.error(f"Failed to parse Claude response: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI returned invalid response. Please try again.",
        )


# ── Endpoint ─────────────────────────────────────────────────────────

@router.post(
    "/optimize-trip",
    response_model=OptimizationResult,
    summary="AI-powered trip route optimization",
    description="Sends trip parameters to Claude AI and returns an optimized multi-city route.",
)
async def optimize_trip(
    body: TripOptimizeRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Validate dates
    if body.end_date <= body.start_date:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="end_date must be after start_date",
        )

    prompt = _build_prompt(body)
    result = await _call_claude(prompt)

    return OptimizationResult(**result)


async def _get_trip_for_insights(
    db: AsyncSession,
    trip_id: _uuid.UUID,
    user_id: _uuid.UUID,
) -> Trip | None:
    q = (
        select(Trip)
        .where(Trip.id == trip_id, Trip.user_id == user_id)
        .options(
            selectinload(Trip.stops).selectinload(Stop.city),
            selectinload(Trip.stops)
            .selectinload(Stop.stop_activities)
            .selectinload(StopActivity.activity),
        )
    )
    result = await db.execute(q)
    return result.scalar_one_or_none()


async def _suggest_cities(
    db: AsyncSession,
    existing_city_ids: set[_uuid.UUID],
    limit: int = 4,
) -> list[City]:
    q = select(City)
    if existing_city_ids:
        q = q.where(City.id.notin_(existing_city_ids))

    q = q.order_by(City.popularity_score.desc().nulls_last(), City.name.asc()).limit(limit)
    result = await db.execute(q)
    return list(result.scalars().all())


def _build_city_reason(city: City, existing_cities: list[City]) -> str:
    countries = {c.country for c in existing_cities}
    regions = {c.region for c in existing_cities if c.region}

    if city.country in countries:
        return f"Fits naturally with your existing {city.country} stops."
    if city.region and city.region in regions:
        return f"Adds another destination in the same {city.region} travel region."
    if city.popularity_score:
        return f"High-interest destination with a popularity score of {float(city.popularity_score):.1f}."
    return "Useful next city to expand this itinerary."


def _build_trip_insights(trip: Trip, suggested_cities: list[City]) -> TripInsightsResult:
    stops = sorted(trip.stops, key=lambda s: s.position_order)
    stop_cities = [s.city for s in stops if s.city]
    stop_count = len(stops)
    country_count = len({city.country for city in stop_cities})
    trip_days = max((trip.end_date - trip.start_date).days + 1, 1)
    average_days = trip_days / stop_count if stop_count else 0
    activity_count = sum(len(stop.stop_activities or []) for stop in stops)

    if stop_count == 0:
        summary = (
            f"{trip.name} is set for {trip_days} days. Add a first city to unlock "
            "route, pacing, and activity insights."
        )
    else:
        country_phrase = f" in {country_count} countries" if country_count else ""
        stop_label = "stop" if stop_count == 1 else "stops"
        summary = f"{trip.name} spans {trip_days} days across {stop_count} {stop_label}{country_phrase}."

    highlights: list[str] = []
    warnings: list[str] = []
    next_steps: list[str] = []

    if stop_count:
        highlights.append(f"Your pacing averages {average_days:.1f} days per stop.")
        if activity_count:
            activity_label = "activity" if activity_count == 1 else "activities"
            highlights.append(f"{activity_count} planned {activity_label} are already attached to the route.")
        if country_count > 1:
            highlights.append(f"The trip has cross-country variety across {country_count} countries.")
        else:
            highlights.append("The route is compact, which can reduce transit overhead.")
    else:
        next_steps.append("Add one city so the itinerary has a starting point.")

    if stop_count and average_days < 2:
        warnings.append("The route may feel rushed because it averages under 2 days per stop.")
    if stop_count == 1 and trip_days >= 5:
        next_steps.append("Consider adding a second city to add contrast to a longer trip.")
    if stop_count and activity_count == 0:
        next_steps.append("Add activities to each city so daily plans and budgets become clearer.")

    city_names = [city.name for city in stop_cities]
    duplicate_names = {name for name in city_names if city_names.count(name) > 1}
    if duplicate_names:
        warnings.append(f"Duplicate city entries detected: {', '.join(sorted(duplicate_names))}.")

    if any(stop.start_date < trip.start_date or stop.end_date > trip.end_date for stop in stops):
        warnings.append("One or more stop dates fall outside the trip date range.")

    if not next_steps:
        next_steps.append("Review the suggested cities below to expand the route without leaving this page.")

    return TripInsightsResult(
        summary=summary,
        highlights=highlights,
        warnings=warnings,
        next_steps=next_steps,
        suggested_cities=[
            InsightCitySuggestion(
                id=city.id,
                name=city.name,
                country=city.country,
                region=city.region,
                image_url=city.image_url,
                reason=_build_city_reason(city, stop_cities),
            )
            for city in suggested_cities
        ],
    )


@router.get(
    "/trips/{trip_id}/insights",
    response_model=TripInsightsResult,
    summary="AI insights for a specific trip",
    description="Returns trip-specific itinerary insights and city suggestions.",
)
async def get_trip_insights(
    trip_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        tid = _uuid.UUID(trip_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid trip ID format")

    trip = await _get_trip_for_insights(db, tid, user.id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    existing_city_ids = {stop.city_id for stop in trip.stops}
    suggested_cities = await _suggest_cities(db, existing_city_ids)
    return _build_trip_insights(trip, suggested_cities)
