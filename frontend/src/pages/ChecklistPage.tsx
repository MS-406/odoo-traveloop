// frontend/src/pages/ChecklistPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ListChecks } from "lucide-react";
import { checklistApi, type ChecklistItem } from "@/api/checklist";
import ChecklistGroup from "@/components/checklist/ChecklistGroup";
import ChecklistForm from "@/components/checklist/ChecklistForm";
import toast from "react-hot-toast";

export default function ChecklistPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    if (!id) return;
    setLoading(true);
    try { const { data } = await checklistApi.list(id); setItems(data); }
    catch { toast.error("Failed to load checklist"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, [id]);

  const handleAdd = async (name: string, category: string) => {
    if (!id) return;
    try { await checklistApi.create(id, { name, category }); toast.success("Item added"); fetchItems(); }
    catch { toast.error("Failed to add item"); }
  };

  const handleToggle = async (itemId: string) => {
    try { await checklistApi.toggle(itemId); fetchItems(); }
    catch { toast.error("Failed to toggle item"); }
  };

  const handleDelete = async (itemId: string) => {
    try { await checklistApi.delete(itemId); toast.success("Item removed"); fetchItems(); }
    catch { toast.error("Failed to remove item"); }
  };

  // Group by category
  const grouped = items.reduce<Record<string, ChecklistItem[]>>((acc, item) => {
    (acc[item.category] = acc[item.category] || []).push(item);
    return acc;
  }, {});
  const totalPacked = items.filter((i) => i.is_packed).length;

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <button onClick={() => navigate(`/trips/${id}`)} className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors"><ArrowLeft className="h-4 w-4" /> Back to Trip</button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2"><ListChecks className="h-6 w-6 text-success" /> Packing List</h1>
          {items.length > 0 && <p className="text-sm text-text-secondary mt-1">{totalPacked}/{items.length} items packed</p>}
          {items.length > 0 && (
            <div className="mt-2 w-full bg-surface-border rounded-full h-2">
              <div className="bg-success h-2 rounded-full transition-all duration-300" style={{ width: `${items.length > 0 ? (totalPacked / items.length) * 100 : 0}%` }} />
            </div>
          )}
        </div>
        <ChecklistForm onSubmit={handleAdd} />
        {loading ? <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="glass-card h-32 animate-pulse bg-surface-border/30" />)}</div>
        : Object.keys(grouped).length === 0 ? <div className="text-center py-16 glass-card text-text-muted"><ListChecks className="h-10 w-10 mx-auto mb-3 opacity-40" /><p className="text-sm">No items yet. Start adding things to pack!</p></div>
        : <div className="space-y-4">{Object.entries(grouped).map(([cat, catItems]) => <ChecklistGroup key={cat} category={cat} items={catItems} onToggle={handleToggle} onDelete={handleDelete} />)}</div>}
      </div>
    </div>
  );
}
