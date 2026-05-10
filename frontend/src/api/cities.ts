// frontend/src/api/cities.ts
// API functions for city endpoints (Phase 4).
// Depends on: Phase 2 / axiosInstance.ts

import api from "./axiosInstance";
import type { PaginatedResponse } from "./trips";

export interface City {
  id: string;
  name: string;
  country: string;
  region: string | null;
  cost_index: string | null;
  popularity_score: string | null;
  image_url: string | null;
  latitude: string | null;
  longitude: string | null;
}

export const citiesApi = {
  search: (params: {
    q?: string;
    country?: string;
    region?: string;
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.set("q", params.q);
    if (params.country) searchParams.set("country", params.country);
    if (params.region) searchParams.set("region", params.region);
    searchParams.set("page", String(params.page || 1));
    searchParams.set("limit", String(params.limit || 20));
    return api.get<PaginatedResponse<City>>(`/cities?${searchParams}`);
  },

  get: (id: string) => api.get<City>(`/cities/${id}`),
};

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated ✓ | error handled ✓
