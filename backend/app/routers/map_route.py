# backend/app/routers/map_route.py
# Trip map data endpoint — returns all data needed for the interactive route map.
# Uses real coordinates from the cities table + Haversine distance calculation.

import math
import uuid as _uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies import get_current_user
from app.models.stop import Stop
from app.models.city import City
from app.models.trip import Trip
from app.models.user import User
from app.schemas.map_route import SegmentInfo, StopMapPoint, TripMapData

router = APIRouter(prefix="/trips", tags=["map"])


# ── Haversine distance ───────────────────────────────────────────────

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two points on Earth in kilometers."""
    R = 6371
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return round(2 * R * math.asin(math.sqrt(a)), 1)


def suggest_transport(distance_km: float) -> tuple[str, float]:
    """Suggest transport mode and estimate travel hours based on distance."""
    if distance_km < 50:
        return ("🚌 Bus/Metro", round(distance_km / 60, 1))
    elif distance_km < 300:
        return ("🚆 Train", round(distance_km / 150, 1))
    elif distance_km < 1500:
        return ("✈️ Short-haul Flight", round(distance_km / 600 + 2.0, 1))
    else:
        return ("✈️ Long-haul Flight", round(distance_km / 800 + 3.0, 1))


def suggest_accommodation(cost_index: float) -> tuple[str, str]:
    """Return accommodation suggestion and best-area tip based on cost_index."""
    ci = float(cost_index) if cost_index else 2.5
    if ci < 2.0:
        return ("Budget hostel or guesthouse (~$20-40/night)", "Stay near the old town or backpacker district")
    elif ci < 3.5:
        return ("3-star hotel or boutique guesthouse (~$60-100/night)", "Stay in the city centre or historic quarter")
    elif ci < 4.5:
        return ("4-star hotel or serviced apartment (~$120-200/night)", "Stay in the main tourist or business district")
    else:
        return ("5-star hotel or premium apartment (~$200+/night)", "Stay near premium zones — book 2-3 months early")


def calculate_zoom(stops: list[dict]) -> int:
    """Calculate appropriate map zoom based on geographic spread of stops."""
    if len(stops) <= 1:
        return 10
    lats = [s["latitude"] for s in stops]
    lngs = [s["longitude"] for s in stops]
    spread = max(max(lats) - min(lats), max(lngs) - min(lngs))
    if spread < 2:
        return 9
    elif spread < 10:
        return 6
    elif spread < 30:
        return 4
    elif spread < 80:
        return 3
    else:
        return 2


# ── Endpoint ─────────────────────────────────────────────────────────

@router.get(
    "/{trip_id}/map-data",
    response_model=TripMapData,
    summary="Get trip map visualization data",
    description="Returns all stops with coordinates, route segments with distances, and map positioning data.",
)
async def get_trip_map_data(
    trip_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        tid = _uuid.UUID(trip_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid trip ID format")

    # Get trip
    trip_q = select(Trip).where(Trip.id == tid, Trip.user_id == user.id)
    trip_result = await db.execute(trip_q)
    trip = trip_result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    # Get stops with cities (ordered)
    stops_q = (
        select(Stop)
        .where(Stop.trip_id == tid)
        .options(selectinload(Stop.city))
        .order_by(Stop.position_order)
    )
    stops_result = await db.execute(stops_q)
    stops_raw = stops_result.scalars().all()

    # Filter stops that have city coordinates
    map_stops: list[dict] = []
    for s in stops_raw:
        city = s.city
        if not city or not city.latitude or not city.longitude:
            continue

        lat = float(city.latitude)
        lng = float(city.longitude)
        nights = (s.end_date - s.start_date).days if s.end_date and s.start_date else 0
        cost_index = float(city.cost_index) if city.cost_index else 2.5
        accom_suggestion, best_area = suggest_accommodation(cost_index)

        # Count activities for this stop
        from sqlalchemy import func
        from app.models.stop_activity import StopActivity
        act_q = select(func.count()).where(StopActivity.stop_id == s.id)
        act_result = await db.execute(act_q)
        act_count = act_result.scalar_one()

        map_stops.append({
            "stop_id": str(s.id),
            "position_order": s.position_order,
            "city_name": city.name,
            "country": city.country,
            "latitude": lat,
            "longitude": lng,
            "start_date": s.start_date,
            "end_date": s.end_date,
            "nights": nights,
            "is_overnight": nights >= 1,
            "activities_count": act_count,
            "estimated_daily_cost": round(cost_index * 80, 2),
            "accommodation_suggestion": accom_suggestion,
            "best_area_to_stay": best_area,
        })

    if not map_stops:
        # Return empty but valid response
        total_days = (trip.end_date - trip.start_date).days if trip.end_date and trip.start_date else 0
        return TripMapData(
            trip_id=str(trip.id),
            trip_name=trip.name,
            total_days=total_days,
            total_distance_km=0,
            stops=[],
            segments=[],
            map_center=[20.0, 0.0],
            map_zoom=2,
        )

    # Build segments between consecutive stops
    segments: list[dict] = []
    total_distance = 0.0
    for i in range(len(map_stops) - 1):
        s1, s2 = map_stops[i], map_stops[i + 1]
        dist = haversine_km(s1["latitude"], s1["longitude"], s2["latitude"], s2["longitude"])
        transport, hours = suggest_transport(dist)
        total_distance += dist
        segments.append({
            "from_city": s1["city_name"],
            "to_city": s2["city_name"],
            "from_coords": [s1["latitude"], s1["longitude"]],
            "to_coords": [s2["latitude"], s2["longitude"]],
            "distance_km": dist,
            "suggested_transport": transport,
            "estimated_travel_hours": hours,
        })

    # Calculate center and zoom
    avg_lat = sum(s["latitude"] for s in map_stops) / len(map_stops)
    avg_lng = sum(s["longitude"] for s in map_stops) / len(map_stops)
    zoom = calculate_zoom(map_stops)

    total_days = (trip.end_date - trip.start_date).days if trip.end_date and trip.start_date else 0

    return TripMapData(
        trip_id=str(trip.id),
        trip_name=trip.name,
        total_days=total_days,
        total_distance_km=round(total_distance, 1),
        stops=[StopMapPoint(**s) for s in map_stops],
        segments=[SegmentInfo(**seg) for seg in segments],
        map_center=[round(avg_lat, 4), round(avg_lng, 4)],
        map_zoom=zoom,
    )
