// frontend/src/components/notes/NoteForm.tsx
import { useState } from "react";
import { X } from "lucide-react";

interface NoteFormProps {
  defaultContent?: string;
  onSubmit: (content: string) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
  title?: string;
}

export default function NoteForm({ defaultContent = "", onSubmit, onClose, isLoading, title = "Add Note" }: NoteFormProps) {
  const [content, setContent] = useState(defaultContent);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    await onSubmit(content.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="glass-card p-6 w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface transition-colors"><X className="h-5 w-5 text-text-muted" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={5} placeholder="Write your note..."
            className="w-full px-4 py-2.5 rounded-lg border border-surface-border bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors" />
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-surface-border text-sm font-medium text-text-secondary hover:bg-surface transition-colors">Cancel</button>
            <button type="submit" disabled={isLoading || !content.trim()} className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-all disabled:opacity-60">
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
