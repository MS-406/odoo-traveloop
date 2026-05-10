// frontend/src/pages/NotesPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, FileText } from "lucide-react";
import { notesApi, type Note } from "@/api/notes";
import NoteCard from "@/components/notes/NoteCard";
import NoteForm from "@/components/notes/NoteForm";
import toast from "react-hot-toast";

export default function NotesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editNote, setEditNote] = useState<Note | null>(null);

  const fetchNotes = async () => {
    if (!id) return;
    setLoading(true);
    try { const { data } = await notesApi.list(id); setNotes(data); }
    catch { toast.error("Failed to load notes"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotes(); }, [id]);

  const handleCreate = async (content: string) => {
    if (!id) return;
    try { await notesApi.create(id, { content }); toast.success("Note added"); setShowForm(false); fetchNotes(); }
    catch { toast.error("Failed to add note"); }
  };

  const handleUpdate = async (content: string) => {
    if (!editNote) return;
    try { await notesApi.update(editNote.id, { content }); toast.success("Note updated"); setEditNote(null); fetchNotes(); }
    catch { toast.error("Failed to update note"); }
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm("Delete this note?")) return;
    try { await notesApi.delete(noteId); toast.success("Note deleted"); fetchNotes(); }
    catch { toast.error("Failed to delete note"); }
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <button onClick={() => navigate(`/trips/${id}`)} className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors"><ArrowLeft className="h-4 w-4" /> Back to Trip</button>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2"><FileText className="h-6 w-6 text-primary" /> Trip Notes</h1>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-all"><Plus className="h-4 w-4" /> Add Note</button>
        </div>
        {loading ? <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="glass-card h-24 animate-pulse bg-surface-border/30" />)}</div>
        : notes.length === 0 ? <div className="text-center py-16 glass-card text-text-muted"><FileText className="h-10 w-10 mx-auto mb-3 opacity-40" /><p className="text-sm">No notes yet. Add your first note!</p></div>
        : <div className="space-y-3">{notes.map((n) => <NoteCard key={n.id} note={n} onEdit={setEditNote} onDelete={handleDelete} />)}</div>}
        {showForm && <NoteForm onSubmit={handleCreate} onClose={() => setShowForm(false)} />}
        {editNote && <NoteForm defaultContent={editNote.content} onSubmit={handleUpdate} onClose={() => setEditNote(null)} title="Edit Note" />}
      </div>
    </div>
  );
}
