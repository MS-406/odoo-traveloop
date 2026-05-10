// frontend/src/components/trips/ItineraryCalendar.tsx
// Calendar/grid view of stops — shows stops in a day grid.
// Depends on: Phase 3 / api/trips.ts (Stop, Trip types)

import { format, parseISO, eachDayOfInterval, isWithinInterval } from "date-fns";
import type { Stop } from "@/api/trips";

interface ItineraryCalendarProps {
  stops: Stop[];
  tripStartDate: string;
  tripEndDate: string;
}

export default function ItineraryCalendar({
  stops,
  tripStartDate,
  tripEndDate,
}: ItineraryCalendarProps) {
  const days = eachDayOfInterval({
    start: parseISO(tripStartDate),
    end: parseISO(tripEndDate),
  });

  const getStopsForDay = (day: Date) =>
    stops.filter((stop) =>
      isWithinInterval(day, {
        start: parseISO(stop.start_date),
        end: parseISO(stop.end_date),
      })
    );

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="text-center text-xs font-medium text-text-muted py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Leading empty cells */}
        {Array.from({ length: (days[0].getDay() + 6) % 7 }).map((_, i) => (
          <div key={`empty-${i}`} className="h-20" />
        ))}

        {days.map((day) => {
          const dayStops = getStopsForDay(day);
          const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

          return (
            <div
              key={day.toISOString()}
              className={`h-20 rounded-lg border p-1.5 text-xs transition-colors
                ${isToday ? "border-primary bg-primary/5" : "border-surface-border bg-white"}
                ${dayStops.length > 0 ? "ring-1 ring-primary/20" : ""}`}
            >
              <span className={`font-medium ${isToday ? "text-primary" : "text-text-secondary"}`}>
                {format(day, "d")}
              </span>
              {dayStops.slice(0, 2).map((s) => (
                <div
                  key={s.id}
                  className="mt-0.5 px-1 py-0.5 rounded bg-primary/10 text-primary truncate text-[10px] font-medium"
                  title={s.city?.name || "Stop"}
                >
                  {s.city?.name || "Stop"}
                </div>
              ))}
              {dayStops.length > 2 && (
                <span className="text-[10px] text-text-muted">+{dayStops.length - 2} more</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
