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
    <div className="min-h-screen bg-surface relative overflow-hidden">
      {/* Decorative background orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8 relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-text-secondary hover:text-primary transition-colors bg-white/50 px-4 py-2 rounded-lg border border-surface-border shadow-sm backdrop-blur-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary tracking-tight">Create New Trip</h1>
          <p className="text-text-secondary mt-1 text-lg">Plan your next adventure</p>
        </div>
        <div className="glass-card p-6 sm:p-8">
          <TripForm onSubmit={handleSubmit} isLoading={isLoading} submitLabel="Create Trip" />
        </div>
      </div>
    </div>
  );
}

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
