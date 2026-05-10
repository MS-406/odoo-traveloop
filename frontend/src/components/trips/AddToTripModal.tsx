// frontend/src/components/trips/AddToTripModal.tsx
import { useState, useEffect } from "react";
import { X, MapPin, Loader2, Plus, Check } from "lucide-react";
import { useTripStore } from "@/stores/tripStore";
import { activitiesApi, type Activity } from "@/api/activities";
import { tripsApi, type TripListItem, type Trip } from "@/api/trips";
import toast from "react-hot-toast";

interface AddToTripModalProps {
  activity: Activity;
  isOpen: boolean;
  onClose: () => void;
}

export default function AddToTripModal({ activity, isOpen, onClose }: AddToTripModalProps) {
  const [trips, setTrips] = useState<TripListItem[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>("");
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [selectedStopId, setSelectedStopId] = useState<string>("");
  const [isLoadingTrips, setIsLoadingTrips] = useState(false);
  const [isLoadingStops, setIsLoadingStops] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      (async () => {
        setIsLoadingTrips(true);
        try {
          const { data } = await tripsApi.list(1, 50);
          setTrips(data.items);
        } catch {
          toast.error("Failed to load trips");
        } finally {
          setIsLoadingTrips(false);
        }
      })();
    } else {
      setSelectedTripId("");
      setSelectedTrip(null);
      setSelectedStopId("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedTripId) {
      (async () => {
        setIsLoadingStops(true);
        try {
          const { data } = await tripsApi.get(selectedTripId);
          setSelectedTrip(data);
          if (data.stops.length > 0) {
            setSelectedStopId(data.stops[0].id);
          }
        } catch {
          toast.error("Failed to load trip stops");
        } finally {
          setIsLoadingStops(false);
        }
      })();
    }
  }, [selectedTripId]);

  const handleAdd = async () => {
    if (!selectedStopId) return;
    setIsSubmitting(true);
    try {
      await activitiesApi.attachToStop(selectedStopId, { activity_id: activity.id });
      toast.success(`Added ${activity.name} to trip!`);
      onClose();
    } catch {
      toast.error("Failed to add activity to trip");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-card w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-surface-border flex items-center justify-between bg-white/50 backdrop-blur-md">
          <h3 className="text-xl font-display font-bold text-text-primary">Add Activity to Trip</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-dim transition-colors">
            <X className="h-5 w-5 text-text-secondary" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-start gap-4 p-3 rounded-xl bg-primary/5 border border-primary/10">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-white shrink-0 shadow-sm">
               {activity.image_url ? (
                  <img src={activity.image_url} alt={activity.name} className="w-full h-full object-cover" />
               ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl bg-surface-dim">🎯</div>
               )}
            </div>
            <div>
              <p className="font-bold text-text-primary">{activity.name}</p>
              <p className="text-sm text-text-secondary">${parseFloat(activity.cost).toFixed(0)} • {activity.type}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-secondary ml-1">Select Trip</label>
              <div className="relative">
                {isLoadingTrips ? (
                   <div className="w-full h-12 rounded-xl border border-surface-border bg-surface-dim animate-pulse flex items-center px-4">
                      <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
                      <span className="text-sm text-text-muted">Loading trips...</span>
                   </div>
                ) : (
                  <select
                    value={selectedTripId}
                    onChange={(e) => setSelectedTripId(e.target.value)}
                    className="w-full h-12 rounded-xl border border-surface-border bg-white px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                  >
                    <option value="">Choose a trip...</option>
                    {trips.map(trip => (
                      <option key={trip.id} value={trip.id}>{trip.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {selectedTripId && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                <label className="text-sm font-bold text-text-secondary ml-1">Select Stop / City</label>
                {isLoadingStops ? (
                   <div className="w-full h-12 rounded-xl border border-surface-border bg-surface-dim animate-pulse flex items-center px-4">
                      <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
                      <span className="text-sm text-text-muted">Loading stops...</span>
                   </div>
                ) : selectedTrip?.stops.length === 0 ? (
                  <div className="p-3 rounded-xl bg-danger/5 border border-danger/10 text-xs text-danger font-medium text-center">
                    No stops added to this trip yet. Add a city to this trip first.
                  </div>
                ) : (
                  <select
                    value={selectedStopId}
                    onChange={(e) => setSelectedStopId(e.target.value)}
                    className="w-full h-12 rounded-xl border border-surface-border bg-white px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                  >
                    {selectedTrip?.stops.map(stop => (
                      <option key={stop.id} value={stop.id}>{stop.city.name}</option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 bg-surface-dim/50 border-t border-surface-border flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-3 rounded-xl bg-white border border-surface-border font-bold text-text-secondary hover:bg-surface-dim transition-all">
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!selectedStopId || isSubmitting}
            className="flex-1 px-4 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add Activity
          </button>
        </div>
      </div>
    </div>
  );
}
