// frontend/src/components/cities/CityCard.tsx
// City card with image, cost index, popularity — for city search page.
// Depends on: Phase 4 / api/cities.ts

import { MapPin, DollarSign, Star } from "lucide-react";
import type { City } from "@/api/cities";

interface CityCardProps {
  city: City;
  onClick?: (city: City) => void;
}

export default function CityCard({ city, onClick }: CityCardProps) {
  const costLevel = city.cost_index ? parseFloat(city.cost_index) : 0;
  const popularity = city.popularity_score ? parseFloat(city.popularity_score) : 0;

  return (
    <div
      onClick={() => onClick?.(city)}
      className="glass-card overflow-hidden cursor-pointer group hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
    >
      {/* Image */}
      <div className="h-32 bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden relative">
        {city.image_url ? (
          <img
            src={city.image_url}
            alt={city.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="h-8 w-8 text-primary/30" />
          </div>
        )}

        {/* Popularity badge */}
        {popularity > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-accent/90 text-white text-xs font-medium">
            <Star className="h-3 w-3" fill="currentColor" />
            {popularity.toFixed(1)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-1">
        <h3 className="font-semibold text-text-primary text-sm group-hover:text-primary transition-colors truncate">
          {city.name}
        </h3>
        <p className="text-xs text-text-secondary">{city.country}</p>
        {city.region && <p className="text-xs text-text-muted">{city.region}</p>}

        {/* Cost index */}
        {costLevel > 0 && (
          <div className="flex items-center gap-1 pt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <DollarSign
                key={i}
                className={`h-3 w-3 ${i < Math.round(costLevel) ? "text-accent" : "text-surface-border"}`}
              />
            ))}
            <span className="text-xs text-text-muted ml-1">Cost</span>
          </div>
        )}
      </div>
    </div>
  );
}

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
