// frontend/src/components/trips/StopForm.tsx
// Add stop modal form — select a city and date range.
// Depends on: Phase 3 / tripStore, Phase 4 / cities API

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin, Calendar, Search, X } from "lucide-react";
import { citiesApi, type City } from "@/api/cities";
import toast from "react-hot-toast";

type SelectableCity = Pick<City, "id" | "name" | "country" | "region">;

const stopSchema = z.object({
  city_id: z.string().min(1, "Please select a city"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
}).refine((d) => d.end_date >= d.start_date, {
  message: "End date must be on or after start date",
  path: ["end_date"],
});

type StopFormValues = z.infer<typeof stopSchema>;

interface StopFormProps {
  onSubmit: (data: StopFormValues) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
  initialCity?: SelectableCity | null;
}

export default function StopForm({ onSubmit, onClose, isLoading, initialCity }: StopFormProps) {
  const [citySearch, setCitySearch] = useState("");
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<SelectableCity | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<StopFormValues>({
    resolver: zodResolver(stopSchema),
    defaultValues: { city_id: "", start_date: "", end_date: "" },
  });

  useEffect(() => {
    if (!initialCity) return;
    setSelectedCity(initialCity);
    setValue("city_id", initialCity.id);
    setCitySearch(`${initialCity.name}, ${initialCity.country}`);
    setShowDropdown(false);
  }, [initialCity, setValue]);

  // Debounced city search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (citySearch.length >= 2) {
        try {
          const { data } = await citiesApi.search({ q: citySearch, limit: 8 });
          setCities(data.items);
          setShowDropdown(true);
        } catch {
          toast.error("Failed to search cities");
        }
      } else {
        setCities([]);
        setShowDropdown(false);
      }
    }, 300); // 300ms debounce
    return () => clearTimeout(timer);
  }, [citySearch]);

  const selectCity = (city: City) => {
    setSelectedCity(city);
    setValue("city_id", city.id);
    setCitySearch(`${city.name}, ${city.country}`);
    setShowDropdown(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="glass-card p-6 w-full max-w-md space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary">Add a Stop</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface transition-colors">
            <X className="h-5 w-5 text-text-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* City search */}
          <div className="relative">
            <label className="block text-sm font-medium text-text-primary mb-1.5">City</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="text"
                value={citySearch}
                onChange={(e) => {
                  setCitySearch(e.target.value);
                  if (selectedCity) {
                    setSelectedCity(null);
                    setValue("city_id", "");
                  }
                }}
                placeholder="Search cities..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white text-sm
                  focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors
                  ${errors.city_id ? "border-danger" : "border-surface-border"}`}
              />
              <input type="hidden" {...register("city_id")} />
            </div>
            {errors.city_id && <p className="mt-1 text-xs text-danger">{errors.city_id.message}</p>}

            {/* Dropdown */}
            {showDropdown && cities.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-surface-border rounded-lg shadow-lg max-h-48 overflow-auto">
                {cities.map((city) => (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => selectCity(city)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-surface transition-colors text-left"
                  >
                    <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">{city.name}</p>
                      <p className="text-xs text-text-muted">{city.country}{city.region ? ` · ${city.region}` : ""}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                  type="date"
                  className={`w-full pl-10 pr-3 py-2.5 rounded-lg border bg-white text-sm
                    focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors
                    ${errors.start_date ? "border-danger" : "border-surface-border"}`}
                  {...register("start_date")}
                />
              </div>
              {errors.start_date && <p className="mt-1 text-xs text-danger">{errors.start_date.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                  type="date"
                  className={`w-full pl-10 pr-3 py-2.5 rounded-lg border bg-white text-sm
                    focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors
                    ${errors.end_date ? "border-danger" : "border-surface-border"}`}
                  {...register("end_date")}
                />
              </div>
              {errors.end_date && <p className="mt-1 text-xs text-danger">{errors.end_date.message}</p>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-surface-border text-sm font-medium text-text-secondary hover:bg-surface transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {isLoading ? "Adding..." : "Add Stop"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
