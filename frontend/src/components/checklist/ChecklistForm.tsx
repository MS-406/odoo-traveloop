// frontend/src/components/checklist/ChecklistForm.tsx
import { useState } from "react";

const CATEGORIES = ["clothing", "documents", "electronics", "toiletries", "medicine", "other"];

interface Props { onSubmit: (name: string, category: string) => Promise<void>; isLoading?: boolean; }

export default function ChecklistForm({ onSubmit, isLoading }: Props) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("other");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onSubmit(name.trim(), category);
    setName("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <div className="flex-1">
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Add item..."
          className="w-full px-3 py-2 rounded-lg border border-surface-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors" />
      </div>
      <select value={category} onChange={(e) => setCategory(e.target.value)}
        className="px-3 py-2 rounded-lg border border-surface-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors capitalize">
        {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
      </select>
      <button type="submit" disabled={isLoading || !name.trim()}
        className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-all disabled:opacity-60">
        Add
      </button>
    </form>
  );
}
