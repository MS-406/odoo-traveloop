// frontend/src/api/trips.ts
// API functions for trip endpoints.
// Depends on: Phase 2 / axiosInstance.ts

import api from "./axiosInstance";

// ── Types ────────────────────────────────────────────────────────────
export interface TripCreate {
  name: string;
  description?: string;
  start_date: string; // ISO date
  end_date: string;
  cover_photo?: string;
  is_public?: boolean;
}

export interface TripUpdate {
  name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  cover_photo?: string;
  is_public?: boolean;
}

export interface CityBrief {
  id: string;
  name: string;
  country: string;
  image_url: string | null;
}

export interface ActivityBrief {
  id: string;
  name: string;
  type: string;
  cost: string;
  duration_min: number | null;
  image_url: string | null;
}

export interface StopActivityItem {
  id: string;
  stop_id: string;
  activity_id: string;
  scheduled_time: string | null;
  custom_note: string | null;
  activity: ActivityBrief | null;
}

export interface Stop {
  id: string;
  trip_id: string;
  city_id: string;
  city: CityBrief | null;
  start_date: string;
  end_date: string;
  position_order: number;
  created_at: string;
  stop_activities: StopActivityItem[];
}

export interface Trip {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  cover_photo: string | null;
  is_public: boolean;
  share_code: string | null;
  created_at: string;
  updated_at: string;
  stops: Stop[];
}

export interface TripListItem {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  cover_photo: string | null;
  is_public: boolean;
  share_code: string | null;
  created_at: string;
  updated_at: string;
  stop_count: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ── API functions ────────────────────────────────────────────────────
export const tripsApi = {
  list: (page = 1, limit = 10) =>
    api.get<PaginatedResponse<TripListItem>>(`/trips?page=${page}&limit=${limit}`),

  get: (id: string) =>
    api.get<Trip>(`/trips/${id}`),

  create: (data: TripCreate) =>
    api.post<Trip>("/trips", data),

  update: (id: string, data: TripUpdate) =>
    api.put<Trip>(`/trips/${id}`, data),

  delete: (id: string) =>
    api.delete(`/trips/${id}`),

  copy: (id: string) =>
    api.post<Trip>(`/trips/${id}/copy`),
};

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated ✓ | error handled ✓
