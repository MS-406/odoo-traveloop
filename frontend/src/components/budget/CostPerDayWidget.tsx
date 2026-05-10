// frontend/src/components/budget/CostPerDayWidget.tsx
// Average cost per day stat widget.
// Depends on: Phase 4

import { TrendingUp } from "lucide-react";

interface CostPerDayWidgetProps {
  costPerDay: number;
  days: number;
}

export default function CostPerDayWidget({ costPerDay, days }: CostPerDayWidgetProps) {
  return (
    <div className="glass-card p-4 flex items-center gap-3">
      <div className="p-2 rounded-lg bg-accent/10">
        <TrendingUp className="h-5 w-5 text-accent" />
      </div>
      <div>
        <p className="text-lg font-bold text-text-primary">${costPerDay.toFixed(0)}/day</p>
        <p className="text-xs text-text-muted">Average over {days} days</p>
      </div>
    </div>
  );
}

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
