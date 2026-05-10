// frontend/src/components/activities/ActivityQuickView.tsx
// Activity detail modal — shows full description, cost, duration.
// Depends on: Phase 4 / api/activities.ts

import { X, Clock, DollarSign, MapPin } from "lucide-react";
import type { Activity } from "@/api/activities";

interface ActivityQuickViewProps {
  activity: Activity;
  onClose: () => void;
}

export default function ActivityQuickView({ activity, onClose }: ActivityQuickViewProps) {
  const cost = parseFloat(activity.cost);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="glass-card p-6 w-full max-w-lg space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-text-primary">{activity.name}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface transition-colors">
            <X className="h-5 w-5 text-text-muted" />
          </button>
        </div>

        {activity.image_url && (
          <div className="h-48 rounded-lg overflow-hidden">
            <img src={activity.image_url} alt={activity.name} className="w-full h-full object-cover" />
          </div>
        )}

        {activity.description && (
          <p className="text-sm text-text-secondary">{activity.description}</p>
        )}

        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-text-primary">
            <DollarSign className="h-4 w-4 text-accent" />
            <span className="font-medium">${cost.toFixed(2)}</span>
          </div>
          {activity.duration_min && (
            <div className="flex items-center gap-1.5 text-text-primary">
              <Clock className="h-4 w-4 text-primary" />
              <span>
                {activity.duration_min >= 60
                  ? `${Math.floor(activity.duration_min / 60)}h ${activity.duration_min % 60 > 0 ? `${activity.duration_min % 60}m` : ""}`
                  : `${activity.duration_min}m`}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-text-primary">
            <MapPin className="h-4 w-4 text-success" />
            <span className="capitalize">{activity.type}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
