// frontend/src/pages/EditTripPage.tsx
// Edit existing trip page.
// Depends on: Phase 3 / TripForm, tripStore

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import TripForm, { type TripFormValues } from "@/components/trips/TripForm";
import { useTripStore } from "@/stores/tripStore";
import toast from "react-hot-toast";

export default function EditTripPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeTrip, isTripLoading, fetchTrip, updateTrip } = useTripStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) fetchTrip(id);
  }, [id, fetchTrip]);

  const handleSubmit = async (data: TripFormValues) => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await updateTrip(id, {
        name: data.name,
        description: data.description || undefined,
        start_date: data.start_date,
        end_date: data.end_date,
        cover_photo: data.cover_photo || undefined,
        is_public: data.is_public,
      });
      toast.success("Trip updated!");
      navigate(`/trips/${id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to update trip");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isTripLoading || !activeTrip) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="glass-card p-6 flex flex-col items-center gap-4 shadow-ambient">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm font-medium text-text-secondary">Loading trip details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface relative overflow-hidden">
      {/* Decorative background orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8 relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-text-secondary hover:text-primary transition-colors bg-white/50 px-4 py-2 rounded-lg border border-surface-border shadow-sm backdrop-blur-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary tracking-tight">Edit Trip</h1>
          <p className="text-text-secondary mt-1 text-lg">{activeTrip.name}</p>
        </div>
        <div className="glass-card p-6 sm:p-8">
          <TripForm
            defaultValues={{
              name: activeTrip.name,
              description: activeTrip.description || "",
              start_date: activeTrip.start_date,
              end_date: activeTrip.end_date,
              cover_photo: activeTrip.cover_photo || "",
              is_public: activeTrip.is_public,
            }}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
            submitLabel="Save Changes"
          />
        </div>
      </div>
    </div>
  );
}

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
