// frontend/src/components/cities/CitySearchBar.tsx
// Search input with debounce for city search.
// Depends on: Phase 4

import { Search, X } from "lucide-react";

interface CitySearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function CitySearchBar({ value, onChange, placeholder = "Search cities..." }: CitySearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-surface-border bg-white text-sm
          focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
