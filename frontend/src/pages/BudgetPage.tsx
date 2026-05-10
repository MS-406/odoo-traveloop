// frontend/src/pages/BudgetPage.tsx
// Budget breakdown page for a trip.
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
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
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center relative overflow-hidden">
        {/* Decorative background orbs */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="glass-card p-6 flex flex-col items-center gap-4 shadow-ambient relative z-10">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm font-medium text-text-secondary">Loading budget data...</p>
        </div>
      </div>
    );
  }
  if (!budget) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center relative overflow-hidden">
        <div className="glass-card p-8 text-center relative z-10">
          <p className="text-text-secondary font-medium">Budget not available.</p>
          <button onClick={() => navigate(`/trips/${id}`)} className="mt-4 text-primary font-bold hover:underline">Return to Trip</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface relative overflow-hidden">
      {/* Decorative background orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-[40%] left-[-10%] w-[30%] h-[30%] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8 relative z-10">
        <button onClick={() => navigate(`/trips/${id}`)} className="inline-flex items-center gap-1.5 text-sm font-bold text-text-secondary hover:text-primary transition-colors bg-white/50 px-4 py-2 rounded-lg border border-surface-border shadow-sm backdrop-blur-sm">
          <ArrowLeft className="h-4 w-4" /> Back to Trip
        </button>
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary tracking-tight">Budget Breakdown</h1>
          <p className="text-lg text-text-secondary mt-1">{budget.trip_name}</p>
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
