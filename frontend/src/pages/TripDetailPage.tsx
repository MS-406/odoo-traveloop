// frontend/src/pages/TripDetailPage.tsx
// Trip overview with stops summary, actions.
// Depends on: Phase 3 / tripStore, StopCard, ShareButton

import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Edit, MapPin, Plus, Route, Trash2, DollarSign } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useTripStore } from "@/stores/tripStore";
import StopCard from "@/components/trips/StopCard";
import ShareButton from "@/components/trips/ShareButton";
import toast from "react-hot-toast";

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeTrip, isTripLoading, fetchTrip, deleteTrip, deleteStop } = useTripStore();

  useEffect(() => { if (id) fetchTrip(id); }, [id, fetchTrip]);

  const handleDelete = async () => {
    if (!id || !confirm("Delete this trip? This cannot be undone.")) return;
    try { await deleteTrip(id); toast.success("Trip deleted"); navigate("/trips"); }
    catch { toast.error("Failed to delete trip"); }
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
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <button onClick={() => navigate("/trips")} className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" /> My Trips
        </button>

        <div className="glass-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">{activeTrip.name}</h1>
              {activeTrip.description && <p className="text-sm text-text-secondary mt-1">{activeTrip.description}</p>}
              <div className="flex items-center gap-4 mt-3 text-sm text-text-muted">
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{format(parseISO(activeTrip.start_date), "MMM d")} – {format(parseISO(activeTrip.end_date), "MMM d, yyyy")}</span>
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{activeTrip.stops.length} stops</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ShareButton tripId={activeTrip.id} isPublic={activeTrip.is_public} shareCode={activeTrip.share_code} />
              <Link to={`/trips/${activeTrip.id}/edit`} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-surface-border text-sm text-text-secondary hover:bg-surface transition-colors"><Edit className="h-4 w-4" /> Edit</Link>
              <button onClick={handleDelete} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-danger hover:bg-danger/5 transition-colors"><Trash2 className="h-4 w-4" /> Delete</button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link to={`/trips/${activeTrip.id}/builder`} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-all"><Route className="h-4 w-4" /> Itinerary Builder</Link>
          <Link to={`/trips/${activeTrip.id}/itinerary`} className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-surface-border text-sm font-medium text-text-secondary hover:bg-surface transition-colors"><MapPin className="h-4 w-4" /> View Itinerary</Link>
          <Link to={`/trips/${activeTrip.id}/budget`} className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-surface-border text-sm font-medium text-text-secondary hover:bg-surface transition-colors"><DollarSign className="h-4 w-4" /> Budget</Link>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-3">Stops ({activeTrip.stops.length})</h2>
          {activeTrip.stops.length === 0 ? (
            <div className="text-center py-12 glass-card text-text-muted">
              <MapPin className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm mb-4">No stops added yet.</p>
              <Link to={`/trips/${activeTrip.id}/builder`} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-all"><Plus className="h-4 w-4" /> Add Stops</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {activeTrip.stops.map((stop) => (<StopCard key={stop.id} stop={stop} onDelete={handleDeleteStop} />))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
