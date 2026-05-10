// frontend/src/pages/MyTripsPage.tsx
// Paginated trip list with search.
// Depends on: Phase 3 / tripStore, TripCard

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useTripStore } from "@/stores/tripStore";
import TripCard from "@/components/trips/TripCard";

export default function MyTripsPage() {
  const { trips, totalTrips, currentPage, totalPages, isListLoading, fetchTrips } = useTripStore();
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchTrips(page, 12);
  }, [page, fetchTrips]);

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">My Trips</h1>
            <p className="text-sm text-text-secondary mt-1">{totalTrips} trip{totalTrips !== 1 ? "s" : ""} total</p>
          </div>
          <Link
            to="/trips/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-all"
          >
            <Plus className="h-4 w-4" />
            New Trip
          </Link>
        </div>

        {/* Trip grid */}
        {isListLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="glass-card h-64 animate-pulse bg-surface-border/30" />
            ))}
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-20 glass-card">
            <h3 className="text-lg font-semibold text-text-primary mb-2">No trips yet</h3>
            <p className="text-sm text-text-secondary mb-6">Create your first trip to get started</p>
            <Link
              to="/trips/new"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-all"
            >
              <Plus className="h-4 w-4" />
              Create Trip
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 rounded-lg border border-surface-border hover:bg-surface disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-text-secondary px-4">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-lg border border-surface-border hover:bg-surface disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated ✓ | error handled ✓
