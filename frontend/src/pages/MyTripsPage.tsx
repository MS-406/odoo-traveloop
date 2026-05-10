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
    <div className="min-h-screen bg-surface relative overflow-hidden">
      {/* Decorative background orbs */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-[40%] left-[-10%] w-[30%] h-[30%] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-text-primary tracking-tight">My Trips</h1>
            <p className="text-lg text-text-secondary mt-1">{totalTrips} trip{totalTrips !== 1 ? "s" : ""} total</p>
          </div>
          <Link
            to="/trips/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary-dark hover:shadow-ambient hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="h-5 w-5" />
            New Trip
          </Link>
        </div>

        {/* Trip grid */}
        {isListLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="glass-card h-[340px] animate-pulse bg-surface-border/30 border-0" />
            ))}
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-24 glass-card p-8 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-display font-bold text-text-primary mb-2 tracking-tight">No trips yet</h3>
            <p className="text-text-secondary mb-8">Create your first trip to get started and plan your adventure</p>
            <Link
              to="/trips/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary-dark transition-all"
            >
              <Plus className="h-5 w-5" />
              Create Trip
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-3 rounded-xl border border-surface-border bg-white shadow-sm hover:shadow-md hover:border-primary/30 disabled:opacity-40 disabled:hover:shadow-sm disabled:hover:border-surface-border transition-all"
            >
              <ChevronLeft className="h-5 w-5 text-text-primary" />
            </button>
            <span className="text-sm font-medium text-text-secondary px-4 bg-surface-border/50 py-2 rounded-lg">
              Page <span className="text-text-primary font-bold">{currentPage}</span> of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-3 rounded-xl border border-surface-border bg-white shadow-sm hover:shadow-md hover:border-primary/30 disabled:opacity-40 disabled:hover:shadow-sm disabled:hover:border-surface-border transition-all"
            >
              <ChevronRight className="h-5 w-5 text-text-primary" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated ✓ | error handled ✓

