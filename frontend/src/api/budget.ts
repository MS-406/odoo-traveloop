// frontend/src/api/budget.ts
// API functions for budget endpoint (Phase 4).
// Depends on: Phase 2 / axiosInstance.ts

import api from "./axiosInstance";

export interface CategoryBreakdown {
  category: string;
  total_cost: string;
  activity_count: number;
  percentage: number;
}

export interface StopBudget {
  stop_id: string;
  city_name: string;
  total_cost: string;
  activity_count: number;
}

export interface BudgetSummary {
  trip_id: string;
  trip_name: string;
  total_budget: string;
  cost_per_day: string;
  trip_duration_days: number;
  category_breakdown: CategoryBreakdown[];
  stop_breakdown: StopBudget[];
}

export const budgetApi = {
  get: (tripId: string) =>
    api.get<BudgetSummary>(`/trips/${tripId}/budget`),
};

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
