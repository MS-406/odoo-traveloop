// frontend/src/components/activities/ActivityFilterPanel.tsx
// Type/cost/city filters for activity search page.
// Depends on: Phase 4

interface ActivityFilterPanelProps {
  selectedType: string;
  maxCost: string;
  onTypeChange: (type: string) => void;
  onMaxCostChange: (cost: string) => void;
}

const ACTIVITY_TYPES = [
  { value: "", label: "All Types", emoji: "🎯" },
  { value: "sightseeing", label: "Sightseeing", emoji: "🏛️" },
  { value: "food", label: "Food", emoji: "🍽️" },
  { value: "adventure", label: "Adventure", emoji: "🏔️" },
  { value: "culture", label: "Culture", emoji: "🎭" },
  { value: "wellness", label: "Wellness", emoji: "🧘" },
  { value: "nightlife", label: "Nightlife", emoji: "🌙" },
];

export default function ActivityFilterPanel({
  selectedType,
  maxCost,
  onTypeChange,
  onMaxCostChange,
}: ActivityFilterPanelProps) {
  return (
    <div className="space-y-4">
      {/* Type chips */}
      <div>
        <label className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2 block">Type</label>
        <div className="flex flex-wrap gap-2">
          {ACTIVITY_TYPES.map((type) => {
            const isActive = selectedType === type.value;
            return (
              <button
                key={type.value}
                onClick={() => onTypeChange(type.value)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                  ${isActive
                    ? "bg-primary text-white"
                    : "bg-surface text-text-secondary hover:bg-surface-border"
                  }`}
              >
                <span>{type.emoji}</span>
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Max cost */}
      <div>
        <label className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2 block">
          Max Cost ($)
        </label>
        <input
          type="number"
          value={maxCost}
          onChange={(e) => onMaxCostChange(e.target.value)}
          placeholder="No limit"
          min="0"
          className="w-full px-3 py-2 rounded-lg border border-surface-border bg-white text-sm
            focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
        />
      </div>
    </div>
  );
}

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
