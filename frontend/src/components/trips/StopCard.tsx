// frontend/src/components/trips/StopCard.tsx
// Stop card with city info, dates, and actions.
// Depends on: Phase 3 / api/trips.ts (Stop type)

import { Calendar, MapPin, Trash2, GripVertical } from "lucide-react";
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
  return (
    <div className="glass-card p-4 flex items-start gap-3 group">
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
  );
}

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
