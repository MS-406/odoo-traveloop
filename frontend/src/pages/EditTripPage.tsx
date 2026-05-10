// frontend/src/pages/EditTripPage.tsx
// Edit existing trip page.
// Depends on: Phase 3 / TripForm, tripStore

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Edit Trip</h1>
          <p className="text-sm text-text-secondary mt-1">{activeTrip.name}</p>
        </div>
        <div className="glass-card p-6">
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
