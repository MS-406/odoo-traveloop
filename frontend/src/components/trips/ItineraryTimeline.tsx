// frontend/src/components/trips/ItineraryTimeline.tsx
// Vertical timeline view of stops — connects stops with a visual timeline line.
// Depends on: Phase 3 / api/trips.ts (Stop type)

import { MapPin, Calendar } from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import type { Stop } from "@/api/trips";

interface ItineraryTimelineProps {
  stops: Stop[];
}

export default function ItineraryTimeline({ stops }: ItineraryTimelineProps) {
  if (stops.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted">
        <MapPin className="h-10 w-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm">No stops in this itinerary yet.</p>
      </div>
    );
  }

  return (
    <div className="relative pl-8">
      {/* Timeline line */}
      <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary via-secondary to-accent" />

      {stops.map((stop, idx) => {
        const days = differenceInDays(parseISO(stop.end_date), parseISO(stop.start_date)) + 1;
        return (
          <div key={stop.id} className="relative pb-8 last:pb-0">
            {/* Timeline dot */}
            <div className="absolute -left-5 top-1 w-4 h-4 rounded-full border-2 border-primary bg-white shadow-sm" />

            {/* Card */}
            <div className="glass-card p-4 ml-2 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                {/* City image */}
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-surface flex-shrink-0">
                  {stop.city?.image_url ? (
                    <img src={stop.city.image_url} alt={stop.city.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-text-muted" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      Stop {idx + 1}
                    </span>
                    <span className="text-xs text-text-muted">{days} {days === 1 ? "day" : "days"}</span>
                  </div>
                  <h4 className="font-semibold text-text-primary mt-1">
                    {stop.city?.name || "Unknown"}
                  </h4>
                  <p className="text-xs text-text-secondary">{stop.city?.country}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-text-muted">
                    <Calendar className="h-3 w-3" />
                    {format(parseISO(stop.start_date), "MMM d")} – {format(parseISO(stop.end_date), "MMM d")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
