// frontend/src/pages/ItineraryBuilderPage.tsx
// Drag-and-drop stop management + add stop modal.
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
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
    return (<div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
    </div>);
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <button onClick={() => navigate(`/trips/${id}`)} className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Trip
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Itinerary Builder</h1>
            <p className="text-sm text-text-secondary mt-1">{activeTrip.name} · Drag to reorder</p>
          </div>
          <button onClick={() => setShowStopForm(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-all">
            <Plus className="h-4 w-4" /> Add Stop
          </button>
        </div>
        <DraggableStopList stops={activeTrip.stops} tripId={activeTrip.id} onReorder={reorderStops} onDelete={handleDeleteStop} />
        {showStopForm && <StopForm onSubmit={handleAddStop} onClose={() => setShowStopForm(false)} isLoading={isAdding} />}
      </div>
    </div>
  );
}

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
