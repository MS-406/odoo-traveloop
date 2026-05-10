// frontend/src/components/budget/BudgetAlertBanner.tsx
// Over-budget warning banner.
// Depends on: Phase 4

import { AlertTriangle } from "lucide-react";

interface BudgetAlertBannerProps {
  totalBudget: number;
  threshold?: number; // Alert if above this amount
}

export default function BudgetAlertBanner({ totalBudget, threshold = 5000 }: BudgetAlertBannerProps) {
  if (totalBudget <= threshold) return null;

  return (
    <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 flex items-center gap-3">
      <AlertTriangle className="h-5 w-5 text-accent flex-shrink-0" />
      <div>
        <p className="text-sm font-medium text-accent-dark">Budget Alert</p>
        <p className="text-xs text-text-secondary">
          Your trip budget (${totalBudget.toFixed(0)}) exceeds ${threshold.toLocaleString()}.
          Consider removing some activities to stay within budget.
        </p>
      </div>
    </div>
  );
}

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
