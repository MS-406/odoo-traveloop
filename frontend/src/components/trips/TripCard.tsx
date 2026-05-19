// frontend/src/components/trips/TripCard.tsx
// Trip card for list views — shows name, dates, stop count, and status.
// Depends on: Phase 3 / api/trips.ts (TripListItem type)

import { Link } from "react-router-dom";
import React from "react";
import { Calendar, MapPin, Globe, Lock, Copy } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { TripListItem } from "@/api/trips";
import toast from "react-hot-toast";
import { useTripStore } from "@/stores/tripStore";

interface TripCardProps {
  trip: TripListItem;
}

const TripCard = React.memo(function TripCard({ trip }: TripCardProps) {
  const { copyTrip } = useTripStore();

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await copyTrip(trip.id);
      toast.success("Trip copied!");
    } catch {
      toast.error("Failed to copy trip");
    }
  };

  const isUpcoming = new Date(trip.start_date) > new Date();
  const isPast = new Date(trip.end_date) < new Date();

  return (
    <Link
      to={`/trips/${trip.id}`}
      id={`trip-card-${trip.id}`}
      className="group block glass-card overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
    >
      {/* Cover image */}
      <div className="h-36 bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden">
        {trip.cover_photo ? (
          <img
            src={trip.cover_photo}
            alt={trip.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="h-10 w-10 text-primary/30" />
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-2 right-2">
          {isUpcoming && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary text-white">
              Upcoming
            </span>
          )}
          {isPast && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-text-muted text-white">
              Completed
            </span>
          )}
          {!isUpcoming && !isPast && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-success text-white">
              Active
            </span>
          )}
        </div>

        {/* Visibility icon */}
        <div className="absolute top-2 left-2">
          {trip.is_public ? (
            <Globe className="h-4 w-4 text-white drop-shadow" />
          ) : (
            <Lock className="h-4 w-4 text-white/70 drop-shadow" />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-text-primary text-base truncate group-hover:text-primary transition-colors">
          {trip.name}
        </h3>

        {trip.description && (
          <p className="text-xs text-text-secondary line-clamp-2">
            {trip.description}
          </p>
        )}

        <div className="flex items-center gap-3 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {format(parseISO(trip.start_date), "MMM d")} – {format(parseISO(trip.end_date), "MMM d, yyyy")}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {trip.stop_count} {trip.stop_count === 1 ? "stop" : "stops"}
          </span>
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-1">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-text-muted hover:text-primary transition-colors p-1 rounded"
            title="Copy trip"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </Link>
  );
});

export default TripCard;
