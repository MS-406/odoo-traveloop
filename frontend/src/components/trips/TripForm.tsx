// frontend/src/components/trips/TripForm.tsx
// Reusable trip create/edit form with react-hook-form + zod validation.
// Depends on: Phase 3 / tripStore

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, FileText, Globe, Image } from "lucide-react";

const tripSchema = z.object({
  name: z.string().min(1, "Trip name is required").max(200),
  description: z.string().max(2000).optional().or(z.literal("")),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  cover_photo: z.string().optional().or(z.literal("")),
  is_public: z.boolean().default(false),
}).refine((data) => data.end_date >= data.start_date, {
  message: "End date must be on or after start date",
  path: ["end_date"],
});

export type TripFormValues = z.infer<typeof tripSchema>;

interface TripFormProps {
  defaultValues?: Partial<TripFormValues>;
  onSubmit: (data: TripFormValues) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export default function TripForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  submitLabel = "Create Trip",
}: TripFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      name: "",
      description: "",
      start_date: "",
      end_date: "",
      cover_photo: "",
      is_public: false,
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* Name */}
      <div>
        <label htmlFor="trip-name" className="block text-sm font-medium text-text-primary mb-1.5">
          Trip Name
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            id="trip-name"
            type="text"
            placeholder="My European Adventure"
            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white text-sm transition-colors
              focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
              ${errors.name ? "border-danger" : "border-surface-border"}`}
            {...register("name")}
          />
        </div>
        {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="trip-desc" className="block text-sm font-medium text-text-primary mb-1.5">
          Description <span className="text-text-muted">(optional)</span>
        </label>
        <textarea
          id="trip-desc"
          rows={3}
          placeholder="Describe your trip..."
          className={`w-full px-4 py-2.5 rounded-lg border bg-white text-sm transition-colors resize-none
            focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
            ${errors.description ? "border-danger" : "border-surface-border"}`}
          {...register("description")}
        />
        {errors.description && <p className="mt-1 text-xs text-danger">{errors.description.message}</p>}
      </div>

      {/* Date range */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="trip-start" className="block text-sm font-medium text-text-primary mb-1.5">
            Start Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              id="trip-start"
              type="date"
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white text-sm transition-colors
                focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                ${errors.start_date ? "border-danger" : "border-surface-border"}`}
              {...register("start_date")}
            />
          </div>
          {errors.start_date && <p className="mt-1 text-xs text-danger">{errors.start_date.message}</p>}
        </div>
        <div>
          <label htmlFor="trip-end" className="block text-sm font-medium text-text-primary mb-1.5">
            End Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              id="trip-end"
              type="date"
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white text-sm transition-colors
                focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                ${errors.end_date ? "border-danger" : "border-surface-border"}`}
              {...register("end_date")}
            />
          </div>
          {errors.end_date && <p className="mt-1 text-xs text-danger">{errors.end_date.message}</p>}
        </div>
      </div>

      {/* Cover photo URL */}
      <div>
        <label htmlFor="trip-photo" className="block text-sm font-medium text-text-primary mb-1.5">
          Cover Photo URL <span className="text-text-muted">(optional)</span>
        </label>
        <div className="relative">
          <Image className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            id="trip-photo"
            type="url"
            placeholder="https://example.com/photo.jpg"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-surface-border bg-white text-sm
              focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            {...register("cover_photo")}
          />
        </div>
      </div>

      {/* Public toggle */}
      <div className="flex items-center gap-3">
        <input
          id="trip-public"
          type="checkbox"
          className="h-4 w-4 rounded border-surface-border text-primary focus:ring-primary/30"
          {...register("is_public")}
        />
        <label htmlFor="trip-public" className="flex items-center gap-1.5 text-sm text-text-secondary cursor-pointer">
          <Globe className="h-4 w-4" />
          Make this trip public (shareable via link)
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 px-4 rounded-lg bg-primary text-white font-medium text-sm
          hover:bg-primary-dark active:scale-[0.98] transition-all
          disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
        ) : (
          submitLabel
        )}
      </button>
    </form>
  );
}

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
