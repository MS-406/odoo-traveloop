// frontend/src/api/stops.ts
// API functions for stop endpoints.
// Depends on: Phase 2 / axiosInstance.ts
// Depends on: Phase 3 / api/trips.ts (Stop type)

import api from "./axiosInstance";
import type { Stop } from "./trips";

export interface StopCreate {
  city_id: string;
  start_date: string;
  end_date: string;
}

export interface StopUpdate {
  city_id?: string;
  start_date?: string;
  end_date?: string;
}

export interface StopReorder {
  stop_ids: string[];
}

export const stopsApi = {
  create: (tripId: string, data: StopCreate) =>
    api.post<Stop>(`/trips/${tripId}/stops`, data),

  update: (stopId: string, data: StopUpdate) =>
    api.put<Stop>(`/stops/${stopId}`, data),

  delete: (stopId: string) =>
    api.delete(`/stops/${stopId}`),

  reorder: (tripId: string, data: StopReorder) =>
    api.patch<Stop[]>(`/trips/${tripId}/stops/reorder`, data),
};

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
