// frontend/src/pages/PublicTripPage.tsx
// Public trip view — anyone with share_code can see this.
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, MapPin, Globe, Copy, Loader2 } from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import api from "@/api/axiosInstance";
import type { Trip } from "@/api/trips";
import ItineraryTimeline from "@/components/trips/ItineraryTimeline";
import toast from "react-hot-toast";

export default function PublicTripPage() {
  const { shareCode } = useParams<{ shareCode: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!shareCode) return;
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get<Trip>(`/trips/public/${shareCode}`);
        setTrip(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [shareCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="glass-card p-6 flex flex-col items-center gap-4 shadow-ambient relative z-10">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm font-medium text-text-secondary">Loading trip details...</p>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="text-center space-y-4 p-10 glass-card max-w-md mx-4 relative z-10">
          <Globe className="h-14 w-14 text-text-muted mx-auto" />
          <h1 className="text-3xl font-display font-bold text-text-primary tracking-tight">Trip Not Found</h1>
          <p className="text-lg text-text-secondary">This trip doesn't exist or isn't public anymore.</p>
          <div className="pt-4">
            <Link to="/" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-white text-base font-bold hover:bg-primary-dark transition-all shadow-sm">
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const days = differenceInDays(parseISO(trip.end_date), parseISO(trip.start_date)) + 1;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied!");
  };

  return (
    <div className="min-h-screen bg-surface relative overflow-hidden">
      {/* Decorative background orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-[40%] left-[-10%] w-[30%] h-[30%] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top bar */}
      <nav className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-surface-border shadow-sm">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-display font-bold gradient-text tracking-tight">🌍 Traveloop</Link>
          <div className="flex items-center gap-3">
            <button onClick={handleCopyLink} className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-all shadow-sm">
              <Copy className="h-4 w-4" /> Copy Link
            </button>
            <Link to="/signup" className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-all shadow-sm">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8 relative z-10">
        {/* Trip header */}
        <div className="glass-card p-6 sm:p-8 space-y-5">
          {trip.cover_photo && (
            <div className="h-56 sm:h-64 rounded-xl overflow-hidden -mt-2 sm:-mt-4 -mx-2 sm:-mx-4 mb-6 shadow-sm">
              <img src={trip.cover_photo} alt={trip.name} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex items-start gap-2">
            <Globe className="h-6 w-6 text-primary flex-shrink-0" />
            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">Public Trip</span>
          </div>
          <h1 className="text-4xl font-display font-bold text-text-primary tracking-tight">{trip.name}</h1>
          {trip.description && <p className="text-lg text-text-secondary">{trip.description}</p>}
          <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-text-muted pt-2 border-t border-surface-border">
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{format(parseISO(trip.start_date), "MMM d")} – {format(parseISO(trip.end_date), "MMM d, yyyy")}</span>
            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{trip.stops.length} stops</span>
            <span className="bg-surface-border/50 px-2 py-0.5 rounded-md text-text-secondary">{days} days</span>
          </div>
        </div>

        {/* Itinerary */}
        <div className="glass-card p-6 sm:p-8">
          <h2 className="text-2xl font-display font-bold text-text-primary mb-6 tracking-tight">Itinerary</h2>
          <ItineraryTimeline stops={trip.stops} />
        </div>

        {/* CTA */}
        <div className="glass-card p-10 text-center space-y-4 bg-gradient-to-br from-primary/5 via-surface to-secondary/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />
          <h3 className="text-xl font-display font-bold text-text-primary">Want to create your own trip?</h3>
          <p className="text-text-secondary max-w-md mx-auto pb-2">Sign up free and start planning your next unforgettable adventure with Traveloop.</p>
          <Link to="/signup" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-white text-base font-bold shadow-sm hover:bg-primary-dark hover:shadow-ambient hover:scale-[1.02] active:scale-[0.98] transition-all">
            Get Started Free
          </Link>
        </div>
      </div>
    </div>
  );
}
