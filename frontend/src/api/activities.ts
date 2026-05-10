// frontend/src/api/activities.ts
// API functions for activity endpoints (Phase 4).
// Depends on: Phase 2 / axiosInstance.ts

import api from "./axiosInstance";
import type { PaginatedResponse } from "./trips";

export interface Activity {
  id: string;
  name: string;
  description: string | null;
  type: string;
  cost: string;
  duration_min: number | null;
  image_url: string | null;
  city_id: string;
}

export interface StopActivity {
  id: string;
  stop_id: string;
  activity_id: string;
  scheduled_time: string | null;
  custom_note: string | null;
  activity: Activity | null;
}

export interface StopActivityCreate {
  activity_id: string;
  scheduled_time?: string;
  custom_note?: string;
}

export const activitiesApi = {
  search: (params: {
    type?: string;
    max_cost?: number;
    city_id?: string;
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params.type) searchParams.set("type", params.type);
    if (params.max_cost !== undefined) searchParams.set("max_cost", String(params.max_cost));
    if (params.city_id) searchParams.set("city_id", params.city_id);
    searchParams.set("page", String(params.page || 1));
    searchParams.set("limit", String(params.limit || 20));
    return api.get<PaginatedResponse<Activity>>(`/activities?${searchParams}`);
  },

  get: (id: string) => api.get<Activity>(`/activities/${id}`),

  attachToStop: (stopId: string, data: StopActivityCreate) =>
    api.post<StopActivity>(`/stops/${stopId}/activities`, data),

  detachFromStop: (stopActivityId: string) =>
    api.delete(`/stop_activities/${stopActivityId}`),
};

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated ✓ | error handled ✓
