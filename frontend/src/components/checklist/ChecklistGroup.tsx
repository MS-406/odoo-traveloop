// frontend/src/components/checklist/ChecklistGroup.tsx
import type { ChecklistItem } from "@/api/checklist";
import ChecklistItemRow from "./ChecklistItemRow";

const CATEGORY_EMOJI: Record<string, string> = {
  clothing: "👕", documents: "📄", electronics: "💻",
  toiletries: "🧴", medicine: "💊", other: "📦",
};

interface Props { category: string; items: ChecklistItem[]; onToggle: (id: string) => void; onDelete: (id: string) => void; }

export default function ChecklistGroup({ category, items, onToggle, onDelete }: Props) {
  const packed = items.filter((i) => i.is_packed).length;
  return (
    <div className="glass-card p-4 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary capitalize flex items-center gap-2">
          {CATEGORY_EMOJI[category] || "📦"} {category}
        </h3>
        <span className="text-xs text-text-muted">{packed}/{items.length} packed</span>
      </div>
      <div className="divide-y divide-surface-border">
        {items.map((item) => (<ChecklistItemRow key={item.id} item={item} onToggle={onToggle} onDelete={onDelete} />))}
      </div>
    </div>
  );
}
