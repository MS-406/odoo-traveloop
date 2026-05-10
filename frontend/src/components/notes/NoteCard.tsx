// frontend/src/components/notes/NoteCard.tsx
import { Trash2, Edit, MapPin } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { Note } from "@/api/notes";

interface NoteCardProps { note: Note; onEdit: (note: Note) => void; onDelete: (id: string) => void; }

export default function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  return (
    <div className="glass-card p-4 group">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-text-primary whitespace-pre-wrap">{note.content}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
            <span>{format(parseISO(note.updated_at), "MMM d, h:mm a")}</span>
            {note.stop_id && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Linked to stop</span>}
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(note)} className="p-1.5 rounded-lg hover:bg-surface text-text-muted hover:text-primary transition-colors"><Edit className="h-4 w-4" /></button>
          <button onClick={() => onDelete(note.id)} className="p-1.5 rounded-lg hover:bg-danger/5 text-text-muted hover:text-danger transition-colors"><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}
