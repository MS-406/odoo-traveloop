// frontend/src/components/map/MapTripStats.tsx
// Horizontal stats bar displayed above the map.

import { MapPin, Globe2, Clock, Moon, DollarSign } from "lucide-react";
import { TripMapData } from "@/api/mapRoute";

interface Props {
  data: TripMapData;
}

export default function MapTripStats({ data }: Props) {
  const totalNights = data.stops.reduce((sum, s) => sum + s.nights, 0);
  const estimatedCost = data.stops.reduce((sum, s) => sum + s.nights * s.estimated_daily_cost, 0);

  // Count transport types
  const transportCounts: Record<string, number> = {};
  data.segments.forEach((seg) => {
    const type = seg.suggested_transport.replace(/[^\w\s/]/g, "").trim();
    transportCounts[type] = (transportCounts[type] || 0) + 1;
  });

  const stats = [
    { icon: MapPin, label: "Stops", value: data.stops.length, color: "text-indigo-500" },
    { icon: Globe2, label: "Distance", value: `${data.total_distance_km.toLocaleString()} km`, color: "text-emerald-500" },
    { icon: Clock, label: "Days", value: data.total_days, color: "text-blue-500" },
    { icon: Moon, label: "Nights", value: totalNights, color: "text-amber-500" },
    { icon: DollarSign, label: "Est. Cost", value: `$${Math.round(estimatedCost).toLocaleString()}`, color: "text-emerald-600" },
  ];

  return (
    <div className="glass-card p-3">
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div className="flex items-center gap-4 flex-wrap">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-1.5">
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
              <div>
                <p className="text-xs text-text-muted">{stat.label}</p>
                <p className="text-sm font-bold text-text-primary">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
        {Object.keys(transportCounts).length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {Object.entries(transportCounts).map(([type, count]) => (
              <span key={type} className="px-2 py-0.5 rounded-full bg-surface text-xs text-text-secondary">
                {type}: {count}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
