// frontend/src/components/checklist/ChecklistItemRow.tsx
import { Check, Square, Trash2 } from "lucide-react";
import type { ChecklistItem } from "@/api/checklist";

interface Props { item: ChecklistItem; onToggle: (id: string) => void; onDelete: (id: string) => void; }

export default function ChecklistItemRow({ item, onToggle, onDelete }: Props) {
  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-surface/50 transition-colors group">
      <button onClick={() => onToggle(item.id)} className="flex-shrink-0">
        {item.is_packed
          ? <Check className="h-5 w-5 text-success" />
          : <Square className="h-5 w-5 text-text-muted" />}
      </button>
      <span className={`flex-1 text-sm ${item.is_packed ? "text-text-muted line-through" : "text-text-primary"}`}>{item.name}</span>
      <button onClick={() => onDelete(item.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded text-text-muted hover:text-danger transition-all"><Trash2 className="h-3.5 w-3.5" /></button>
    </div>
  );
}
