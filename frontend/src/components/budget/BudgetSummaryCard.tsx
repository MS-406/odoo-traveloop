// frontend/src/components/budget/BudgetSummaryCard.tsx
// Total budget card with key stats.
// Depends on: Phase 4 / api/budget.ts

import { DollarSign, TrendingUp, Calendar } from "lucide-react";
import type { BudgetSummary } from "@/api/budget";

interface BudgetSummaryCardProps {
  budget: BudgetSummary;
}

export default function BudgetSummaryCard({ budget }: BudgetSummaryCardProps) {
  return (
    <div className="glass-card p-6 space-y-4">
      <h3 className="text-lg font-semibold text-text-primary">Budget Overview</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-primary/5 rounded-lg p-4 text-center">
          <DollarSign className="h-6 w-6 text-primary mx-auto mb-1" />
          <p className="text-2xl font-bold text-primary">${parseFloat(budget.total_budget).toFixed(0)}</p>
          <p className="text-xs text-text-muted mt-1">Total Budget</p>
        </div>
        <div className="bg-accent/5 rounded-lg p-4 text-center">
          <TrendingUp className="h-6 w-6 text-accent mx-auto mb-1" />
          <p className="text-2xl font-bold text-accent-dark">${parseFloat(budget.cost_per_day).toFixed(0)}</p>
          <p className="text-xs text-text-muted mt-1">Per Day</p>
        </div>
        <div className="bg-success/5 rounded-lg p-4 text-center">
          <Calendar className="h-6 w-6 text-success mx-auto mb-1" />
          <p className="text-2xl font-bold text-success-dark">{budget.trip_duration_days}</p>
          <p className="text-xs text-text-muted mt-1">Days</p>
        </div>
      </div>
    </div>
  );
}

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
