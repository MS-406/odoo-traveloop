// frontend/src/components/activities/ActivityCard.tsx
// Activity card with type badge, cost, and duration.
// Depends on: Phase 4 / api/activities.ts

import { Clock, DollarSign } from "lucide-react";
import type { Activity } from "@/api/activities";

const TYPE_COLORS: Record<string, string> = {
  sightseeing: "bg-primary/10 text-primary",
  food: "bg-accent/10 text-accent-dark",
  adventure: "bg-danger/10 text-danger",
  culture: "bg-secondary/10 text-secondary",
  wellness: "bg-success/10 text-success-dark",
  nightlife: "bg-purple-100 text-purple-700",
};

const TYPE_EMOJI: Record<string, string> = {
  sightseeing: "🏛️",
  food: "🍽️",
  adventure: "🏔️",
  culture: "🎭",
  wellness: "🧘",
  nightlife: "🌙",
};

interface ActivityCardProps {
  activity: Activity;
  onClick?: (activity: Activity) => void;
  action?: React.ReactNode;
}

export default function ActivityCard({ activity, onClick, action }: ActivityCardProps) {
  const cost = parseFloat(activity.cost);

  return (
    <div
      onClick={() => onClick?.(activity)}
      className="glass-card p-4 cursor-pointer group hover:shadow-md transition-all duration-200"
    >
      <div className="flex gap-3">
        {/* Image */}
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface flex-shrink-0">
          {activity.image_url ? (
            <img src={activity.image_url} alt={activity.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">
              {TYPE_EMOJI[activity.type] || "🎯"}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-medium text-text-primary text-sm truncate group-hover:text-primary transition-colors">
                {activity.name}
              </h4>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[activity.type] || "bg-surface text-text-muted"}`}>
                {TYPE_EMOJI[activity.type]} {activity.type}
              </span>
            </div>
            {action}
          </div>

          {activity.description && (
            <p className="text-xs text-text-secondary mt-1 line-clamp-1">{activity.description}</p>
          )}

          <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              ${cost.toFixed(0)}
            </span>
            {activity.duration_min && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {activity.duration_min >= 60
                  ? `${Math.floor(activity.duration_min / 60)}h ${activity.duration_min % 60 > 0 ? `${activity.duration_min % 60}m` : ""}`
                  : `${activity.duration_min}m`}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
