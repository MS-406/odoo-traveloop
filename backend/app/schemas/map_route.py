# backend/app/schemas/map_route.py
# Pydantic schemas for trip map/route visualization data.

from datetime import date
from pydantic import BaseModel


class StopMapPoint(BaseModel):
    stop_id: str
    position_order: int
    city_name: str
    country: str
    latitude: float
    longitude: float
    start_date: date
    end_date: date
    nights: int
    is_overnight: bool
    activities_count: int
    estimated_daily_cost: float
    accommodation_suggestion: str
    best_area_to_stay: str


class SegmentInfo(BaseModel):
    from_city: str
    to_city: str
    from_coords: list[float]
    to_coords: list[float]
    distance_km: float
    suggested_transport: str
    estimated_travel_hours: float


class TripMapData(BaseModel):
    trip_id: str
    trip_name: str
    total_days: int
    total_distance_km: float
    stops: list[StopMapPoint]
    segments: list[SegmentInfo]
    map_center: list[float]
    map_zoom: int
