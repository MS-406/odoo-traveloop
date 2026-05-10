// frontend/src/pages/PublicTripPage.tsx
// Public trip view — anyone with share_code can see this.
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, MapPin, Globe, Copy } from "lucide-react";
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
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center space-y-4 p-8 glass-card max-w-md mx-4">
          <Globe className="h-12 w-12 text-text-muted mx-auto" />
          <h1 className="text-2xl font-bold text-text-primary">Trip Not Found</h1>
          <p className="text-text-secondary">This trip doesn't exist or isn't public anymore.</p>
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-all">
            Go Home
          </Link>
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
    <div className="min-h-screen bg-surface">
      {/* Top bar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-surface-border">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-14">
          <Link to="/" className="text-xl font-bold gradient-text">🌍 Traveloop</Link>
          <div className="flex items-center gap-2">
            <button onClick={handleCopyLink} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-all">
              <Copy className="h-4 w-4" /> Copy Link
            </button>
            <Link to="/signup" className="px-4 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-all">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Trip header */}
        <div className="glass-card p-6 space-y-4">
          {trip.cover_photo && (
            <div className="h-48 rounded-lg overflow-hidden -mt-2 -mx-2 mb-4">
              <img src={trip.cover_photo} alt={trip.name} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex items-start gap-2">
            <Globe className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">Public Trip</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">{trip.name}</h1>
          {trip.description && <p className="text-text-secondary">{trip.description}</p>}
          <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{format(parseISO(trip.start_date), "MMM d")} – {format(parseISO(trip.end_date), "MMM d, yyyy")}</span>
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{trip.stops.length} stops</span>
            <span>{days} days</span>
          </div>
        </div>

        {/* Itinerary */}
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-4">Itinerary</h2>
          <ItineraryTimeline stops={trip.stops} />
        </div>

        {/* CTA */}
        <div className="glass-card p-6 text-center space-y-3 bg-gradient-to-r from-primary/5 to-secondary/5">
          <h3 className="font-semibold text-text-primary">Want to create your own trip?</h3>
          <p className="text-sm text-text-secondary">Sign up free and start planning your adventure.</p>
          <Link to="/signup" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-all">
            Get Started Free
          </Link>
        </div>
      </div>
    </div>
  );
}
