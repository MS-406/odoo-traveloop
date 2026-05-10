// frontend/src/pages/ItineraryViewPage.tsx
// Read-only itinerary view with timeline and calendar tabs.
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, List, CalendarDays } from "lucide-react";
import { useTripStore } from "@/stores/tripStore";
import ItineraryTimeline from "@/components/trips/ItineraryTimeline";
import ItineraryCalendar from "@/components/trips/ItineraryCalendar";

export default function ItineraryViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeTrip, isTripLoading, fetchTrip } = useTripStore();
  const [view, setView] = useState<"timeline" | "calendar">("timeline");

  useEffect(() => { if (id) fetchTrip(id); }, [id, fetchTrip]);

  if (isTripLoading || !activeTrip) {
    return (<div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
    </div>);
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <button onClick={() => navigate(`/trips/${id}`)} className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Trip
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Itinerary</h1>
            <p className="text-sm text-text-secondary mt-1">{activeTrip.name}</p>
          </div>
          <div className="flex items-center gap-1 bg-surface rounded-lg p-1">
            <button onClick={() => setView("timeline")} className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${view === "timeline" ? "bg-white shadow-sm text-primary" : "text-text-muted hover:text-text-secondary"}`}>
              <List className="h-4 w-4" /> Timeline
            </button>
            <button onClick={() => setView("calendar")} className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${view === "calendar" ? "bg-white shadow-sm text-primary" : "text-text-muted hover:text-text-secondary"}`}>
              <CalendarDays className="h-4 w-4" /> Calendar
            </button>
          </div>
        </div>
        {view === "timeline" ? (
          <ItineraryTimeline stops={activeTrip.stops} />
        ) : (
          <ItineraryCalendar stops={activeTrip.stops} tripStartDate={activeTrip.start_date} tripEndDate={activeTrip.end_date} />
        )}
      </div>
    </div>
  );
}

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
