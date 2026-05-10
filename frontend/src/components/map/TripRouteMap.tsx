// frontend/src/components/map/TripRouteMap.tsx
// Main interactive trip route map component using Leaflet + OpenStreetMap.

import { useState, useEffect, useCallback, useMemo } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Loader2, AlertTriangle, MapPin, Maximize2 } from "lucide-react";
import toast from "react-hot-toast";
import { mapRouteApi, TripMapData, StopMapPoint } from "@/api/mapRoute";
import MapTripStats from "./MapTripStats";
import MapStopSidebar from "./MapStopSidebar";
import MapLegend from "./MapLegend";
import { useNavigate } from "react-router-dom";

// ── Custom marker icon factory ──────────────────────────────────────

function createStopIcon(order: number, isOvernight: boolean, isActive: boolean): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:36px; height:36px; border-radius:50%;
        background:${isActive ? "#2563EB" : isOvernight ? "#F59E0B" : "white"};
        border:3px solid ${isActive ? "#1D4ED8" : isOvernight ? "#D97706" : "#2563EB"};
        display:flex; align-items:center; justify-content:center;
        font-weight:bold; font-size:14px; color:${isActive || isOvernight ? "white" : "#111827"};
        box-shadow:0 2px 8px rgba(0,0,0,0.2); cursor:pointer;
        transition: all 0.2s ease;
      ">${order}</div>
      ${isOvernight ? '<div style="position:absolute;top:-6px;right:-6px;font-size:14px;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.3));">🌙</div>' : ""}
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

// ── Map controller for programmatic actions ─────────────────────────

function FlyToStop({ coords, zoom }: { coords: [number, number] | null; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo(coords, zoom, { duration: 1.2 });
    }
  }, [coords, zoom, map]);
  return null;
}

function FitBoundsControl({ stops }: { stops: StopMapPoint[] }) {
  const map = useMap();
  const fitAll = useCallback(() => {
    if (stops.length === 0) return;
    const bounds = L.latLngBounds(stops.map((s) => [s.latitude, s.longitude]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
  }, [map, stops]);

  return (
    <div className="leaflet-top leaflet-right" style={{ marginTop: "10px", marginRight: "10px" }}>
      <div className="leaflet-control">
        <button
          onClick={fitAll}
          className="bg-white border border-gray-300 rounded-lg p-2 shadow-md hover:bg-gray-50 transition"
          title="Fit all stops"
        >
          <Maximize2 className="h-4 w-4 text-gray-700" />
        </button>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────

interface TripRouteMapProps {
  tripId: string;
  compact?: boolean;
}

export default function TripRouteMap({ tripId, compact = false }: TripRouteMapProps) {
  const navigate = useNavigate();
  const [data, setData] = useState<TripMapData | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error" | "empty">("loading");
  const [activeStopId, setActiveStopId] = useState<string | null>(null);
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setStatus("loading");
      try {
        const { data: mapData } = await mapRouteApi.getMapData(tripId);
        if (mapData.stops.length === 0) {
          setStatus("empty");
        } else {
          setData(mapData);
          setStatus("success");
        }
      } catch {
        setStatus("error");
        toast.error("Failed to load map data");
      }
    };
    fetchData();
  }, [tripId]);

  const handleStopClick = useCallback((stopId: string, lat: number, lng: number) => {
    setActiveStopId(stopId);
    setFlyTarget([lat, lng]);
  }, []);

  const polylinePositions = useMemo(() => {
    if (!data) return [];
    return data.segments.map((seg) => [seg.from_coords, seg.to_coords] as [[number, number], [number, number]]);
  }, [data]);

  // ── Loading ───────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className={`glass-card flex flex-col items-center justify-center text-center ${compact ? "h-[200px]" : "h-[500px]"}`}>
        <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
        <p className="text-sm text-text-secondary">Loading your route…</p>
      </div>
    );
  }

  // ── Empty ─────────────────────────────────────────────────
  if (status === "empty") {
    return (
      <div className={`glass-card flex flex-col items-center justify-center text-center ${compact ? "h-[200px]" : "h-[400px]"}`}>
        <MapPin className="h-10 w-10 text-text-muted mb-3" />
        <h3 className="text-sm font-semibold text-text-primary mb-1">No Route to Display</h3>
        <p className="text-xs text-text-secondary mb-3">Add stops to your trip to see the route map.</p>
        {!compact && (
          <button
            onClick={() => navigate(`/trips/${tripId}/builder`)}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition"
          >
            Add Stops
          </button>
        )}
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────
  if (status === "error" || !data) {
    return (
      <div className={`glass-card flex flex-col items-center justify-center text-center ${compact ? "h-[200px]" : "h-[400px]"}`}>
        <AlertTriangle className="h-10 w-10 text-danger mb-3" />
        <h3 className="text-sm font-semibold text-text-primary mb-1">Could Not Load Map</h3>
        <p className="text-xs text-text-secondary mb-3">There was a problem loading route data.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  // ── Compact mode (MiniMapPreview) ─────────────────────────
  if (compact) {
    return (
      <div className="glass-card overflow-hidden relative group">
        <div className="h-[200px]">
          <MapContainer
            center={data.map_center}
            zoom={data.map_zoom}
            scrollWheelZoom={false}
            dragging={false}
            zoomControl={false}
            attributionControl={false}
            className="h-full w-full"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {data.stops.map((stop) => (
              <Marker
                key={stop.stop_id}
                position={[stop.latitude, stop.longitude]}
                icon={createStopIcon(stop.position_order + 1, stop.is_overnight, false)}
              />
            ))}
            {polylinePositions.map((pos, i) => (
              <Polyline key={i} positions={pos} color="#2563EB" weight={3} opacity={0.6} dashArray="8,6" />
            ))}
          </MapContainer>
        </div>
        <button
          onClick={() => navigate(`/trips/${tripId}/itinerary?tab=map`)}
          className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur border border-surface-border text-xs font-medium text-text-primary hover:bg-white shadow-lg transition flex items-center gap-1 opacity-0 group-hover:opacity-100"
        >
          <Maximize2 className="h-3 w-3" /> Open Full Map
        </button>
      </div>
    );
  }

  // ── Full Map View ─────────────────────────────────────────
  return (
    <div className="space-y-4">
      <MapTripStats data={data} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Map */}
        <div className="lg:col-span-3 glass-card overflow-hidden" style={{ height: "520px" }}>
          <MapContainer
            center={data.map_center}
            zoom={data.map_zoom}
            scrollWheelZoom={true}
            className="h-full w-full z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <FlyToStop coords={flyTarget} zoom={10} />
            <FitBoundsControl stops={data.stops} />

            {/* Route lines */}
            {polylinePositions.map((pos, i) => (
              <Polyline
                key={i}
                positions={pos}
                pathOptions={{
                  color: "#2563EB",
                  weight: 3,
                  opacity: 0.7,
                  dashArray: "10, 8",
                }}
              />
            ))}

            {/* Stop markers */}
            {data.stops.map((stop) => (
              <Marker
                key={stop.stop_id}
                position={[stop.latitude, stop.longitude]}
                icon={createStopIcon(stop.position_order + 1, stop.is_overnight, activeStopId === stop.stop_id)}
                eventHandlers={{
                  click: () => handleStopClick(stop.stop_id, stop.latitude, stop.longitude),
                }}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <h4 className="font-bold text-sm">{stop.city_name}, {stop.country}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(stop.start_date).toLocaleDateString()} → {new Date(stop.end_date).toLocaleDateString()}
                      {stop.nights > 0 && <span className="ml-1">({stop.nights} night{stop.nights > 1 ? "s" : ""})</span>}
                    </p>
                    <p className="text-xs mt-1.5">🏨 {stop.accommodation_suggestion}</p>
                    <p className="text-xs mt-1">📍 {stop.best_area_to_stay}</p>
                    {stop.activities_count > 0 && (
                      <p className="text-xs mt-1">🎯 {stop.activities_count} activit{stop.activities_count > 1 ? "ies" : "y"} planned</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}

            <MapLegend />
          </MapContainer>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-2">
          <MapStopSidebar
            data={data}
            activeStopId={activeStopId}
            onStopClick={handleStopClick}
          />
        </div>
      </div>
    </div>
  );
}
