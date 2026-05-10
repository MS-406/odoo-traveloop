// frontend/src/pages/BudgetPage.tsx
// Budget breakdown page for a trip.
import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Plus, Trash2, DollarSign, Edit } from "lucide-react";
import { budgetApi, type BudgetSummary, type BudgetItem } from "@/api/budget";
import BudgetSummaryCard from "@/components/budget/BudgetSummaryCard";
import BudgetPieChart from "@/components/budget/BudgetPieChart";
import BudgetBarChart from "@/components/budget/BudgetBarChart";
import BudgetAlertBanner from "@/components/budget/BudgetAlertBanner";
import AddBudgetItemModal from "@/components/budget/AddBudgetItemModal";
import toast from "react-hot-toast";

export default function BudgetPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [budget, setBudget] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<BudgetItem | null>(null);

  const fetchBudget = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await budgetApi.get(id);
      setBudget(data);
    } catch {
      toast.error("Failed to load budget");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBudget();
  }, [fetchBudget]);

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Remove this expense?")) return;
    try {
      await budgetApi.deleteItem(itemId);
      toast.success("Expense removed");
      fetchBudget();
    } catch {
      toast.error("Failed to remove expense");
    }
  };

  const handleEditItem = (item: BudgetItem) => {
    setItemToEdit(item);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setItemToEdit(null);
  };

  if (loading && !budget) {
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
    <div className="min-h-screen bg-surface relative overflow-hidden pb-20">
      {/* Decorative background orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-[40%] left-[-10%] w-[30%] h-[30%] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8 relative z-10">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(`/trips/${id}`)} className="inline-flex items-center gap-1.5 text-sm font-bold text-text-secondary hover:text-primary transition-colors bg-white/50 px-4 py-2 rounded-lg border border-surface-border shadow-sm backdrop-blur-sm">
            <ArrowLeft className="h-4 w-4" /> Back to Trip
          </button>
          
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all"
          >
            <Plus className="h-4 w-4" /> Add Expense
          </button>
        </div>

        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary tracking-tight">Budget Breakdown</h1>
          <p className="text-lg text-text-secondary mt-1">{budget.trip_name}</p>
        </div>

        <BudgetAlertBanner totalBudget={parseFloat(budget.total_budget)} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <BudgetSummaryCard budget={budget} />
            
            <div className="glass-card overflow-hidden">
              <div className="p-6 border-b border-surface-border flex items-center justify-between">
                <h3 className="text-lg font-bold text-text-primary">Manual Expenses</h3>
                <span className="text-xs font-medium px-2 py-1 bg-surface-dim rounded-full text-text-muted">
                  {budget.manual_items.length} items
                </span>
              </div>
              
              <div className="divide-y divide-surface-border">
                {budget.manual_items.length === 0 ? (
                  <div className="p-10 text-center text-text-muted">
                    <DollarSign className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No manual expenses added yet.</p>
                  </div>
                ) : (
                  budget.manual_items.map((item) => (
                    <div key={item.id} className="p-4 flex items-center justify-between hover:bg-surface-dim/50 transition-colors group">
                      <div className="flex gap-4 items-center">
                        <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                           <DollarSign className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-text-primary text-sm">{item.title}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-primary/70">{item.category}</span>
                            {item.notes && <span className="text-[10px] text-text-muted italic truncate max-w-[150px]">• {item.notes}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-text-primary mr-4">${parseFloat(item.amount).toLocaleString()}</span>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => handleEditItem(item)}
                            className="p-2 rounded-lg text-primary opacity-0 group-hover:opacity-100 hover:bg-primary/5 transition-all"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-2 rounded-lg text-danger opacity-0 group-hover:opacity-100 hover:bg-danger/5 transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <BudgetPieChart categories={budget.category_breakdown} />
            <BudgetBarChart stops={budget.stop_breakdown} />
          </div>
        </div>
      </div>

      <AddBudgetItemModal 
        tripId={id || ""} 
        isOpen={isAddModalOpen} 
        onClose={handleCloseModal} 
        onSuccess={fetchBudget}
        itemToEdit={itemToEdit}
      />
    </div>
  );
}
// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
