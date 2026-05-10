// frontend/src/components/budget/AddBudgetItemModal.tsx
import { X, Loader2, Plus, Save } from "lucide-react";
import { budgetApi, type BudgetItem } from "@/api/budget";
import toast from "react-hot-toast";

interface AddBudgetItemModalProps {
  tripId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  itemToEdit?: BudgetItem | null;
}

const CATEGORIES = ["Flight", "Hotel", "Food", "Transport", "Activity", "Shopping", "Other"];

export default function AddBudgetItemModal({ tripId, isOpen, onClose, onSuccess, itemToEdit }: AddBudgetItemModalProps) {
  const [title, setTitle] = useState(itemToEdit?.title || "");
  const [category, setCategory] = useState(itemToEdit?.category || CATEGORIES[0]);
  const [amount, setAmount] = useState(itemToEdit?.amount || "");
  const [notes, setNotes] = useState(itemToEdit?.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state with itemToEdit when it changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle(itemToEdit?.title || "");
      setCategory(itemToEdit?.category || CATEGORIES[0]);
      setAmount(itemToEdit?.amount || "");
      setNotes(itemToEdit?.notes || "");
    }
  }, [isOpen, itemToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    setIsSubmitting(true);
    try {
      if (itemToEdit) {
        await budgetApi.updateItem(itemToEdit.id, {
          title,
          category,
          amount: parseFloat(amount as string),
          notes: notes || undefined,
        });
        toast.success("Expense updated");
      } else {
        await budgetApi.createItem(tripId, {
          title,
          category,
          amount: parseFloat(amount as string),
          notes: notes || undefined,
        });
        toast.success("Expense added");
      }
      onSuccess();
      onClose();
    } catch {
      toast.error(itemToEdit ? "Failed to update expense" : "Failed to add expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-card w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-surface-border flex items-center justify-between bg-white/50 backdrop-blur-md">
          <h3 className="text-xl font-display font-bold text-text-primary">
            {itemToEdit ? "Edit Expense" : "Add Expense"}
          </h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-dim transition-colors">
            <X className="h-5 w-5 text-text-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-secondary ml-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Flight to Paris"
              required
              className="w-full h-12 rounded-xl border border-surface-border bg-white px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-secondary ml-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-12 rounded-xl border border-surface-border bg-white px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-secondary ml-1">Amount ($)</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                className="w-full h-12 rounded-xl border border-surface-border bg-white px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-text-secondary ml-1">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Extra details..."
              rows={3}
              className="w-full rounded-xl border border-surface-border bg-white p-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl bg-white border border-surface-border font-bold text-text-secondary hover:bg-surface-dim transition-all">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : itemToEdit ? (
                <Save className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {itemToEdit ? "Update Expense" : "Save Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
