// frontend/src/components/map/MapStopSidebar.tsx
// Scrollable stop list synced with the map — clicking a stop flies to it.

import { useEffect, useRef } from "react";
import { MapPin, Moon, Sun, Hotel, Navigation, Clock, Ticket } from "lucide-react";
import { TripMapData } from "@/api/mapRoute";

interface Props {
  data: TripMapData;
  activeStopId: string | null;
  onStopClick: (stopId: string, lat: number, lng: number) => void;
}

export default function MapStopSidebar({ data, activeStopId, onStopClick }: Props) {
  const activeRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active stop
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeStopId]);

  return (
    <div className="glass-card p-3 h-[520px] overflow-y-auto space-y-0">
      <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-1.5 sticky top-0 bg-white/90 backdrop-blur z-10 py-1">
        <Navigation className="h-4 w-4 text-primary" /> Route ({data.stops.length} stops)
      </h3>

      {data.stops.map((stop, idx) => {
        const isActive = stop.stop_id === activeStopId;
        const segment = data.segments[idx]; // segment TO next stop (if exists)

        return (
          <div key={stop.stop_id}>
            {/* Stop card */}
            <div
              ref={isActive ? activeRef : null}
              onClick={() => onStopClick(stop.stop_id, stop.latitude, stop.longitude)}
              className={`p-3 rounded-xl cursor-pointer transition-all ${
                isActive
                  ? "bg-primary/5 border-l-4 border-primary shadow-sm"
                  : "hover:bg-surface border-l-4 border-transparent"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <span className={`flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold flex-shrink-0 ${
                  stop.is_overnight
                    ? "bg-amber-100 text-amber-700 border-2 border-amber-300"
                    : "bg-indigo-100 text-indigo-700 border-2 border-indigo-300"
                }`}>
                  {stop.position_order + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-text-primary truncate">
                    {stop.city_name}, {stop.country}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
                    <span>{new Date(stop.start_date).toLocaleDateString("en", { month: "short", day: "numeric" })} → {new Date(stop.end_date).toLocaleDateString("en", { month: "short", day: "numeric" })}</span>
                    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                      stop.is_overnight ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
                    }`}>
                      {stop.is_overnight ? <><Moon className="h-2.5 w-2.5" /> {stop.nights}n</> : <><Sun className="h-2.5 w-2.5" /> Day</>}
                    </span>
                  </div>

                  {/* Details (shown when active) */}
                  {isActive && (
                    <div className="mt-2 space-y-1.5 text-xs animate-in fade-in">
                      <p className="flex items-center gap-1.5 text-text-secondary">
                        <Hotel className="h-3 w-3 text-indigo-400" /> {stop.accommodation_suggestion}
                      </p>
                      <p className="flex items-center gap-1.5 text-text-secondary">
                        <MapPin className="h-3 w-3 text-emerald-400" /> {stop.best_area_to_stay}
                      </p>
                      {stop.activities_count > 0 && (
                        <p className="flex items-center gap-1.5 text-text-secondary">
                          <Ticket className="h-3 w-3 text-purple-400" /> {stop.activities_count} activit{stop.activities_count > 1 ? "ies" : "y"} planned
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Segment connector to next stop */}
            {segment && (
              <div className="flex items-center gap-2 py-2 pl-6">
                <div className="w-px h-6 bg-surface-border ml-3" />
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-surface text-[10px] text-text-muted">
                  <span>{segment.suggested_transport}</span>
                  <span>·</span>
                  <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" /> {segment.estimated_travel_hours}h</span>
                  <span>·</span>
                  <span>{segment.distance_km.toLocaleString()} km</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
