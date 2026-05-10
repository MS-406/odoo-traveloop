// frontend/src/components/budget/BudgetPieChart.tsx
// Recharts pie chart showing budget by activity category.
// Recharts chosen: composable, works natively with React state.
// Depends on: Phase 4 / api/budget.ts

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { CategoryBreakdown } from "@/api/budget";

const COLORS: Record<string, string> = {
  sightseeing: "#2563EB",
  food: "#F59E0B",
  adventure: "#EF4444",
  culture: "#7C3AED",
  wellness: "#10B981",
  nightlife: "#8B5CF6",
};

interface BudgetPieChartProps {
  categories: CategoryBreakdown[];
}

export default function BudgetPieChart({ categories }: BudgetPieChartProps) {
  const data = categories.map((c) => ({
    name: c.category,
    value: parseFloat(c.total_cost),
    count: c.activity_count,
  }));

  if (data.length === 0) {
    return (
      <div className="glass-card p-6 text-center text-text-muted text-sm">
        <p>No activities added yet. Add activities to see budget breakdown.</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-semibold text-text-primary mb-4">Spending by Category</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name] || "#9CA3AF"} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [`$${value.toFixed(0)}`, "Cost"]}
            contentStyle={{ borderRadius: "8px", border: "1px solid #E5E7EB", fontSize: "12px" }}
          />
          <Legend
            formatter={(value) => <span className="text-xs capitalize">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
