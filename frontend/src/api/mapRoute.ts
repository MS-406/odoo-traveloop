// frontend/src/api/mapRoute.ts
// API client for trip map visualization data.

import api from "@/api/axiosInstance";

export interface StopMapPoint {
  stop_id: string;
  position_order: number;
  city_name: string;
  country: string;
  latitude: number;
  longitude: number;
  start_date: string;
  end_date: string;
  nights: number;
  is_overnight: boolean;
  activities_count: number;
  estimated_daily_cost: number;
  accommodation_suggestion: string;
  best_area_to_stay: string;
}

export interface SegmentInfo {
  from_city: string;
  to_city: string;
  from_coords: [number, number];
  to_coords: [number, number];
  distance_km: number;
  suggested_transport: string;
  estimated_travel_hours: number;
}

export interface TripMapData {
  trip_id: string;
  trip_name: string;
  total_days: number;
  total_distance_km: number;
  stops: StopMapPoint[];
  segments: SegmentInfo[];
  map_center: [number, number];
  map_zoom: number;
}

export const mapRouteApi = {
  getMapData: (tripId: string) =>
    api.get<TripMapData>(`/trips/${tripId}/map-data`),
};
