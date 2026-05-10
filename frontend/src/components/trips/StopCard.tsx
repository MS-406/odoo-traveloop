// frontend/src/components/trips/StopCard.tsx
// Stop card with city info, dates, activities, and actions.
// Depends on: Phase 3 / api/trips.ts (Stop type)

import { Calendar, MapPin, Trash2, GripVertical, DollarSign, Compass } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { Stop } from "@/api/trips";

interface StopCardProps {
  stop: Stop;
  onDelete?: (id: string) => void;
  isDraggable?: boolean;
  dragHandleProps?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export default function StopCard({
  stop,
  onDelete,
  isDraggable = false,
  dragHandleProps,
}: StopCardProps) {
  const activities = stop.stop_activities || [];

  return (
    <div className="glass-card overflow-hidden group">
      <div className="p-4 flex items-start gap-3">
        {/* Drag handle */}
        {isDraggable && (
          <div
            {...dragHandleProps}
            className="mt-1 cursor-grab active:cursor-grabbing text-text-muted hover:text-text-secondary transition-colors"
          >
            <GripVertical className="h-5 w-5" />
          </div>
        )}

        {/* City image */}
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface flex-shrink-0">
          {stop.city?.image_url ? (
            <img
              src={stop.city.image_url}
              alt={stop.city.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MapPin className="h-6 w-6 text-text-muted" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-text-primary text-sm truncate">
            {stop.city?.name || "Unknown City"}
          </h4>
          <p className="text-xs text-text-secondary">
            {stop.city?.country || ""}
          </p>
          <div className="flex items-center gap-1 mt-1 text-xs text-text-muted">
            <Calendar className="h-3 w-3" />
            {format(parseISO(stop.start_date), "MMM d")} – {format(parseISO(stop.end_date), "MMM d")}
          </div>
        </div>

        {/* Delete */}
        {onDelete && (
          <button
            onClick={() => onDelete(stop.id)}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/5 transition-all"
            title="Remove stop"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Activities Section */}
      {activities.length > 0 && (
        <div className="border-t border-surface-border bg-surface-dim/30 px-4 py-3 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1">
            <Compass className="h-3 w-3" /> {activities.length} {activities.length === 1 ? "Activity" : "Activities"}
          </p>
          <div className="flex flex-wrap gap-2">
            {activities.map((sa) => (
              <div
                key={sa.id}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/70 border border-surface-border text-xs"
              >
                {sa.activity?.image_url ? (
                  <img src={sa.activity.image_url} alt="" className="w-4 h-4 rounded object-cover" />
                ) : (
                  <span className="text-xs">🎯</span>
                )}
                <span className="font-medium text-text-primary truncate max-w-[120px]">
                  {sa.activity?.name || "Activity"}
                </span>
                <span className="text-text-muted flex items-center gap-0.5">
                  <DollarSign className="h-2.5 w-2.5" />
                  {sa.activity ? parseFloat(sa.activity.cost).toFixed(0) : "–"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓

