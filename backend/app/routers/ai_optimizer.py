# backend/app/routers/ai_optimizer.py
# AI-powered trip optimizer using Claude API.
# New file — registered in main.py.

import json
import logging
from datetime import date
from typing import Literal

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.dependencies import get_current_user
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
