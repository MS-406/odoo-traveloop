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
    <div className="min-h-screen bg-surface relative overflow-hidden">
      {/* Decorative background orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8 relative z-10">
        <button onClick={() => navigate(`/trips/${id}`)} className="inline-flex items-center gap-1.5 text-sm font-bold text-text-secondary hover:text-primary transition-colors bg-white/50 px-4 py-2 rounded-lg border border-surface-border shadow-sm backdrop-blur-sm"><ArrowLeft className="h-4 w-4" /> Back to Trip</button>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-display font-bold text-text-primary flex items-center gap-3 tracking-tight"><FileText className="h-8 w-8 text-primary" /> Trip Notes</h1>
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary-dark hover:shadow-ambient active:scale-[0.98] transition-all"><Plus className="h-5 w-5" /> Add Note</button>
        </div>
        {loading ? <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="glass-card h-32 animate-pulse bg-surface-border/30 border-0" />)}</div>
        : notes.length === 0 ? <div className="text-center py-20 glass-card text-text-muted"><FileText className="h-12 w-12 mx-auto mb-4 opacity-40 text-primary" /><p className="text-base font-medium">No notes yet. Add your first note!</p></div>
        : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{notes.map((n) => <NoteCard key={n.id} note={n} onEdit={setEditNote} onDelete={handleDelete} />)}</div>}
        {showForm && <NoteForm onSubmit={handleCreate} onClose={() => setShowForm(false)} />}
        {editNote && <NoteForm defaultContent={editNote.content} onSubmit={handleUpdate} onClose={() => setEditNote(null)} title="Edit Note" />}
      </div>
    </div>
  );
}
