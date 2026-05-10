// frontend/src/pages/CreateTripPage.tsx
// New trip creation page.
// Depends on: Phase 3 / TripForm, tripStore

import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import TripForm, { type TripFormValues } from "@/components/trips/TripForm";
import { useTripStore } from "@/stores/tripStore";
import toast from "react-hot-toast";
import { useState } from "react";

export default function CreateTripPage() {
  const navigate = useNavigate();
  const { createTrip } = useTripStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: TripFormValues) => {
    setIsLoading(true);
    try {
      const trip = await createTrip({
        name: data.name,
        description: data.description || undefined,
        start_date: data.start_date,
        end_date: data.end_date,
        cover_photo: data.cover_photo || undefined,
        is_public: data.is_public,
      });
      toast.success("Trip created!");
      navigate(`/trips/${trip.id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to create trip");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Create New Trip</h1>
          <p className="text-sm text-text-secondary mt-1">Plan your next adventure</p>
        </div>
        <div className="glass-card p-6">
          <TripForm onSubmit={handleSubmit} isLoading={isLoading} submitLabel="Create Trip" />
        </div>
      </div>
    </div>
  );
}

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
