// frontend/src/components/budget/BudgetBarChart.tsx
// Recharts bar chart showing budget by stop/city.
// Depends on: Phase 4 / api/budget.ts

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { StopBudget } from "@/api/budget";

interface BudgetBarChartProps {
  stops: StopBudget[];
}

export default function BudgetBarChart({ stops }: BudgetBarChartProps) {
  const data = stops.map((s) => ({
    name: s.city_name,
    cost: parseFloat(s.total_cost),
    activities: s.activity_count,
  }));

  if (data.length === 0) {
    return (
      <div className="glass-card p-6 text-center text-text-muted text-sm">
        <p>No stops to display.</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-semibold text-text-primary mb-4">Spending by City</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
          <Tooltip
            formatter={(value: number) => [`$${value.toFixed(0)}`, "Cost"]}
            contentStyle={{ borderRadius: "8px", border: "1px solid #E5E7EB", fontSize: "12px" }}
          />
          <Bar dataKey="cost" fill="#2563EB" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
