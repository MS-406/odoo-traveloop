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
    <div className="min-h-screen bg-surface relative overflow-hidden">
      {/* Decorative background orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-success/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8 relative z-10">
        <button onClick={() => navigate(`/trips/${id}`)} className="inline-flex items-center gap-1.5 text-sm font-bold text-text-secondary hover:text-primary transition-colors bg-white/50 px-4 py-2 rounded-lg border border-surface-border shadow-sm backdrop-blur-sm"><ArrowLeft className="h-4 w-4" /> Back to Trip</button>
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary tracking-tight flex items-center gap-3"><ListChecks className="h-8 w-8 text-success" /> Packing List</h1>
          {items.length > 0 && <p className="text-lg text-text-secondary mt-1">{totalPacked}/{items.length} items packed</p>}
          {items.length > 0 && (
            <div className="mt-4 w-full bg-surface-border rounded-full h-2.5 overflow-hidden shadow-inner">
              <div className="bg-success h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${items.length > 0 ? (totalPacked / items.length) * 100 : 0}%` }} />
            </div>
          )}
        </div>
        <div className="glass-card p-6">
          <ChecklistForm onSubmit={handleAdd} />
        </div>
        {loading ? <div className="space-y-4">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="glass-card h-32 animate-pulse bg-surface-border/30 border-0" />)}</div>
        : Object.keys(grouped).length === 0 ? <div className="text-center py-20 glass-card text-text-muted"><ListChecks className="h-12 w-12 mx-auto mb-4 opacity-40 text-success" /><p className="text-base font-medium">No items yet. Start adding things to pack!</p></div>
        : <div className="space-y-6">{Object.entries(grouped).map(([cat, catItems]) => <ChecklistGroup key={cat} category={cat} items={catItems} onToggle={handleToggle} onDelete={handleDelete} />)}</div>}
      </div>
    </div>
  );
}
