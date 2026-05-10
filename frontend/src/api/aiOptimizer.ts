// frontend/src/api/aiOptimizer.ts
// API client for AI Trip Optimizer feature.

import api from "@/api/axiosInstance";

// ── Request Types ─────────────────────────────────────────────────

export interface OptimizeRequest {
  starting_city: string;
  destination_cities: string[];
  travelers: number;
  budget_usd: number;
  transport_preference: "flight" | "train" | "bus" | "car" | "mixed";
  travel_style: "budget" | "medium" | "luxury";
  start_date: string;
  end_date: string;
  priority: "cheapest" | "fastest" | "balanced" | "scenic";
  interests: string[];
}

// ── Response Types ────────────────────────────────────────────────

export interface RouteStop {
  order: number;
  city: string;
  country: string;
  days_recommended: number;
  estimated_cost_usd: number;
  transport_from_previous: string;
  transport_cost_usd: number;
  transport_duration_hours: number;
  best_activities: string[];
  best_stay_type: string;
  estimated_stay_cost_per_night: number;
  local_tips: string;
}

export interface BudgetBreakdown {
  transport: number;
  accommodation: number;
  activities: number;
  meals: number;
}

export interface OptimizationResult {
  optimized_route: RouteStop[];
  total_estimated_cost_usd: number;
  total_days: number;
  savings_vs_unoptimized_pct: number;
  optimization_summary: string;
  budget_breakdown: BudgetBreakdown;
  warnings: string[];
  alternative_suggestion: string;
}

// ── API Functions ─────────────────────────────────────────────────

export const aiOptimizerApi = {
  optimize: (data: OptimizeRequest) =>
    api.post<OptimizationResult>("/ai/optimize-trip", data),
};
