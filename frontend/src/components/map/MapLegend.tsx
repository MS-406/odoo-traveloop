// frontend/src/components/map/MapLegend.tsx
// Map overlay legend panel — shows marker and line meanings.

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function MapLegend() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className="leaflet-bottom leaflet-left"
      style={{ marginBottom: "10px", marginLeft: "10px", zIndex: 800 }}
    >
      <div className="leaflet-control">
        <div className="bg-white/95 backdrop-blur rounded-xl border border-gray-200 shadow-lg overflow-hidden" style={{ minWidth: "140px" }}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            🗺️ Legend
            {collapsed ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>

          {!collapsed && (
            <div className="px-3 pb-2.5 space-y-1.5 text-[11px] text-gray-600 border-t border-gray-100 pt-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-white border-2 border-blue-500 text-[9px] font-bold text-gray-800">1</span>
                <span>Regular stop</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-amber-400 border-2 border-amber-600 text-[9px] font-bold text-white">2</span>
                <span>Overnight stop 🌙</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-0 w-5 border-t-2 border-dashed border-blue-500" />
                <span>Route path</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs">✈️</span>
                <span>Flight</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs">🚆</span>
                <span>Train</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs">🚌</span>
                <span>Bus</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
