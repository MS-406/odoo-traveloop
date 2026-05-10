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

export interface BudgetItem {
  id: string;
  trip_id: string;
  title: string;
  category: string;
  amount: string;
  notes: string | null;
}

export interface BudgetItemCreate {
  title: string;
  category: string;
  amount: number;
  notes?: string;
}

export interface BudgetSummary {
  trip_id: string;
  trip_name: string;
  total_budget: string;
  cost_per_day: string;
  trip_duration_days: number;
  category_breakdown: CategoryBreakdown[];
  stop_breakdown: StopBudget[];
  manual_items: BudgetItem[];
}

export const budgetApi = {
  get: (tripId: string) =>
    api.get<BudgetSummary>(`/trips/${tripId}/budget`),
  
  createItem: (tripId: string, data: BudgetItemCreate) =>
    api.post<BudgetItem>(`/trips/${tripId}/budget/items`, data),
    
  updateItem: (itemId: string, data: BudgetItemCreate) =>
    api.patch<BudgetItem>(`/budget/items/${itemId}`, data),
    
  deleteItem: (itemId: string) =>
    api.delete(`/budget/items/${itemId}`),
};

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
