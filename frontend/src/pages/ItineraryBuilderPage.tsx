// frontend/src/pages/ItineraryBuilderPage.tsx
// Drag-and-drop stop management + add stop modal.
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Loader2 } from "lucide-react";
import { useTripStore } from "@/stores/tripStore";
import DraggableStopList from "@/components/trips/DraggableStopList";
import StopForm from "@/components/trips/StopForm";
import toast from "react-hot-toast";

export default function ItineraryBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeTrip, isTripLoading, fetchTrip, addStop, deleteStop, reorderStops } = useTripStore();
  const [showStopForm, setShowStopForm] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => { if (id) fetchTrip(id); }, [id, fetchTrip]);

  const handleAddStop = async (data: { city_id: string; start_date: string; end_date: string }) => {
    if (!id) return;
    setIsAdding(true);
    try { await addStop(id, data); toast.success("Stop added!"); setShowStopForm(false); }
    catch (err: any) { toast.error(err?.response?.data?.detail || "Failed to add stop"); }
    finally { setIsAdding(false); }
  };

  const handleDeleteStop = async (stopId: string) => {
    if (!confirm("Remove this stop?")) return;
    try { await deleteStop(stopId); toast.success("Stop removed"); }
    catch { toast.error("Failed to remove stop"); }
  };

  if (isTripLoading || !activeTrip) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="glass-card p-6 flex flex-col items-center gap-4 shadow-ambient relative z-10">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm font-medium text-text-secondary">Loading itinerary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface relative overflow-hidden">
      {/* Decorative background orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8 relative z-10">
        <button onClick={() => navigate(`/trips/${id}`)} className="inline-flex items-center gap-1.5 text-sm font-bold text-text-secondary hover:text-primary transition-colors bg-white/50 px-4 py-2 rounded-lg border border-surface-border shadow-sm backdrop-blur-sm">
          <ArrowLeft className="h-4 w-4" /> Back to Trip
        </button>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-text-primary tracking-tight">Itinerary Builder</h1>
            <p className="text-lg text-text-secondary mt-1">{activeTrip.name} · Drag to reorder</p>
          </div>
          <button onClick={() => setShowStopForm(true)} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary-dark hover:shadow-ambient active:scale-[0.98] transition-all">
            <Plus className="h-5 w-5" /> Add Stop
          </button>
        </div>
        <DraggableStopList stops={activeTrip.stops} tripId={activeTrip.id} onReorder={reorderStops} onDelete={handleDeleteStop} />
        {showStopForm && <StopForm onSubmit={handleAddStop} onClose={() => setShowStopForm(false)} isLoading={isAdding} />}
      </div>
    </div>
  );
}

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
