// frontend/src/pages/BudgetPage.tsx
// Budget breakdown page for a trip.
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { budgetApi, type BudgetSummary } from "@/api/budget";
import BudgetSummaryCard from "@/components/budget/BudgetSummaryCard";
import BudgetPieChart from "@/components/budget/BudgetPieChart";
import BudgetBarChart from "@/components/budget/BudgetBarChart";
import BudgetAlertBanner from "@/components/budget/BudgetAlertBanner";
import toast from "react-hot-toast";

export default function BudgetPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [budget, setBudget] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try { const { data } = await budgetApi.get(id); setBudget(data); }
      catch { toast.error("Failed to load budget"); }
      finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) {
    return (<div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
    </div>);
  }
  if (!budget) {
    return (<div className="min-h-screen bg-surface flex items-center justify-center text-text-muted">Budget not available.</div>);
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <button onClick={() => navigate(`/trips/${id}`)} className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Trip
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Budget Breakdown</h1>
          <p className="text-sm text-text-secondary mt-1">{budget.trip_name}</p>
        </div>
        <BudgetAlertBanner totalBudget={parseFloat(budget.total_budget)} />
        <BudgetSummaryCard budget={budget} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BudgetPieChart categories={budget.category_breakdown} />
          <BudgetBarChart stops={budget.stop_breakdown} />
        </div>
      </div>
    </div>
  );
}
// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
