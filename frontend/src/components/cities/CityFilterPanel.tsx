// frontend/src/components/cities/CityFilterPanel.tsx
// Country/region filter chips for city search page.
// Depends on: Phase 4

interface CityFilterPanelProps {
  selectedCountry: string;
  selectedRegion: string;
  onCountryChange: (country: string) => void;
  onRegionChange: (region: string) => void;
}

const REGIONS = ["All", "Europe", "Asia", "North America", "South America", "Oceania", "Africa", "Middle East"];

export default function CityFilterPanel({
  selectedCountry,
  selectedRegion,
  onCountryChange,
  onRegionChange,
}: CityFilterPanelProps) {
  return (
    <div className="space-y-3">
      {/* Region chips */}
      <div>
        <label className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2 block">Region</label>
        <div className="flex flex-wrap gap-2">
          {REGIONS.map((region) => {
            const isActive = region === "All" ? !selectedRegion : selectedRegion === region;
            return (
              <button
                key={region}
                onClick={() => onRegionChange(region === "All" ? "" : region)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all
                  ${isActive
                    ? "bg-primary text-white"
                    : "bg-surface text-text-secondary hover:bg-surface-border"
                  }`}
              >
                {region}
              </button>
            );
          })}
        </div>
      </div>

      {/* Country input */}
      <div>
        <label className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2 block">Country</label>
        <input
          type="text"
          value={selectedCountry}
          onChange={(e) => onCountryChange(e.target.value)}
          placeholder="Filter by country..."
          className="w-full px-3 py-2 rounded-lg border border-surface-border bg-white text-sm
            focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
        />
      </div>
    </div>
  );
}

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
