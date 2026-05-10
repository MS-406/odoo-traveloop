// frontend/src/pages/TripDetailPage.tsx
// Trip overview with stops summary, actions.
// Depends on: Phase 3 / tripStore, StopCard, ShareButton

import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Edit, MapPin, Plus, Route, Trash2, DollarSign, FileText, ListChecks, Globe } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useTripStore } from "@/stores/tripStore";
import StopCard from "@/components/trips/StopCard";
import ShareButton from "@/components/trips/ShareButton";
import toast from "react-hot-toast";

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeTrip, isTripLoading, fetchTrip, deleteTrip, deleteStop } = useTripStore();

  useEffect(() => { if (id) fetchTrip(id); }, [id, fetchTrip]);

  const handleDelete = async () => {
    if (!id || !confirm("Delete this trip? This cannot be undone.")) return;
    try { await deleteTrip(id); toast.success("Trip deleted"); navigate("/trips"); }
    catch { toast.error("Failed to delete trip"); }
  };

  const handleDeleteStop = async (stopId: string) => {
    if (!confirm("Remove this stop?")) return;
    try { await deleteStop(stopId); toast.success("Stop removed"); }
    catch { toast.error("Failed to remove stop"); }
  };

  if (isTripLoading || !activeTrip) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Calculate budget stats
  const totalBudget = activeTrip.total_budget || 3500; // Mock default if missing
  const totalSpent = 2450; // Mock current spend

  return (
    <div className="min-h-screen bg-surface font-sans pb-24">
      {/* Hero Section */}
      <div className="relative h-72 sm:h-96 w-full">
        {/* Placeholder for destination image */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent overflow-hidden">
            <img src="https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?q=80&w=2000&auto=format&fit=crop" alt="Destination" className="w-full h-full object-cover opacity-60 mix-blend-overlay" />
        </div>
        
        {/* Glassmorphism Overlay */}
        <div className="absolute bottom-0 inset-x-0 bg-surface-card/60 backdrop-blur-xl border-t border-surface-border p-6 sm:p-8">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <Link to="/trips" className="inline-flex items-center gap-1 text-sm font-medium text-text-primary hover:text-primary transition-colors mb-4 bg-white/70 px-4 py-1.5 rounded-full backdrop-blur-md shadow-sm">
                <ArrowLeft className="h-4 w-4" /> Back to Trips
              </Link>
              <h1 className="text-3xl sm:text-5xl font-display font-bold text-text-primary tracking-tight">
                {activeTrip.name}
              </h1>
              {activeTrip.description && <p className="text-text-secondary mt-2 text-lg">{activeTrip.description}</p>}
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm font-medium text-text-secondary">
                <span className="flex items-center gap-1.5 bg-white/70 shadow-sm px-3 py-1.5 rounded-lg"><Calendar className="h-4 w-4 text-primary" />{format(parseISO(activeTrip.start_date), "MMM d")} – {format(parseISO(activeTrip.end_date), "MMM d, yyyy")}</span>
                <span className="flex items-center gap-1.5 bg-white/70 shadow-sm px-3 py-1.5 rounded-lg"><MapPin className="h-4 w-4 text-primary" />{activeTrip.stops.length} stops</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <ShareButton tripId={activeTrip.id} isPublic={activeTrip.is_public} shareCode={activeTrip.share_code} />
              <Link to={`/trips/${activeTrip.id}/edit`} className="flex items-center justify-center p-3 rounded-xl bg-white shadow-sm hover:shadow-md transition-all text-text-primary hover:text-primary">
                <Edit className="h-5 w-5" />
              </Link>
              <button onClick={handleDelete} className="flex items-center justify-center p-3 rounded-xl bg-white shadow-sm hover:shadow-md transition-all text-danger hover:bg-danger/5">
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        
        {/* Quick Tools */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-10">
          <Link to={`/trips/${activeTrip.id}/builder`} className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-primary text-white hover:bg-primary-dark transition-all shadow-lg shadow-primary/20">
            <Route className="h-6 w-6" />
            <span className="text-sm font-medium text-center">Builder</span>
          </Link>
          <Link to={`/trips/${activeTrip.id}/itinerary`} className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-surface-card border border-surface-border hover:shadow-ambient transition-all text-text-primary group">
            <MapPin className="h-6 w-6 text-accent group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-center">Map View</span>
          </Link>
          <Link to={`/trips/${activeTrip.id}/budget`} className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-surface-card border border-surface-border hover:shadow-ambient transition-all text-text-primary group">
            <DollarSign className="h-6 w-6 text-success group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-center">Budget</span>
          </Link>
          <Link to={`/trips/${activeTrip.id}/notes`} className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-surface-card border border-surface-border hover:shadow-ambient transition-all text-text-primary group">
            <FileText className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-center">Notes</span>
          </Link>
          <Link to={`/trips/${activeTrip.id}/checklist`} className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-surface-card border border-surface-border hover:shadow-ambient transition-all text-text-primary group">
            <ListChecks className="h-6 w-6 text-secondary group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-center">Checklist</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main Content Area - Itinerary Timeline */}
            <div className="lg:col-span-2 space-y-10">
                
                <div>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-display font-bold text-text-primary">Itinerary</h2>
                        <Link to={`/trips/${activeTrip.id}/builder`} className="text-sm font-medium text-primary hover:text-primary-dark flex items-center gap-1"><Plus className="h-4 w-4"/> Add Stop</Link>
                    </div>

                    {activeTrip.stops.length === 0 ? (
                        <div className="text-center py-16 bg-surface-card border border-surface-border rounded-2xl shadow-sm">
                        <div className="mx-auto w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mb-4">
                            <MapPin className="h-8 w-8 text-primary/50" />
                        </div>
                        <h3 className="text-xl font-display font-semibold text-text-primary mb-2">No stops added yet</h3>
                        <p className="text-text-secondary mb-6">Start building your perfect itinerary.</p>
                        <Link to={`/trips/${activeTrip.id}/builder`} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark transition-all">
                            <Plus className="h-4 w-4" /> Add First Stop
                        </Link>
                        </div>
                    ) : (
                        <div className="relative pl-4 sm:pl-8 border-l-2 border-surface-border space-y-8">
                            {activeTrip.stops.map((stop, index) => (
                                <div key={stop.id} className="relative">
                                    {/* Timeline Node */}
                                    <div className="absolute -left-[21px] sm:-left-[37px] top-6 w-4 h-4 rounded-full bg-accent border-[3px] border-surface shadow-sm"></div>
                                    <StopCard stop={stop} onDelete={handleDeleteStop} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Horizontal Activities Scroll (Design Element) */}
                <div>
                     <h2 className="text-2xl font-display font-bold text-text-primary mb-6">Suggested Activities</h2>
                     <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
                        {[
                            { title: "Catamaran Sunset Cruise", location: "Oia", price: "$120", time: "3h" },
                            { title: "Volcano Tour", location: "Fira", price: "$45", time: "4h" },
                            { title: "Wine Tasting", location: "Pyrgos", price: "$60", time: "2h" }
                        ].map((act, i) => (
                             <div key={i} className="min-w-[240px] snap-start bg-surface-card border border-surface-border rounded-2xl p-4 shadow-sm hover:shadow-ambient transition-all cursor-pointer group">
                                <div className="h-32 rounded-xl bg-surface-dim mb-4 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors"></div>
                                </div>
                                <h3 className="font-semibold text-text-primary">{act.title}</h3>
                                <div className="flex items-center justify-between mt-3 text-sm text-text-secondary">
                                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3"/> {act.location}</span>
                                    <span className="font-medium text-success">{act.price}</span>
                                </div>
                             </div>
                        ))}
                     </div>
                </div>

            </div>

            {/* Sticky Sidebar */}
            <div className="space-y-6">
                <div className="sticky top-24">
                    <div className="bg-surface-card border border-surface-border rounded-2xl p-6 shadow-ambient">
                        <h3 className="text-lg font-display font-bold text-text-primary mb-6">Budget Overview</h3>
                        
                        {/* Circular Progress Mock */}
                        <div className="flex justify-center mb-8">
                            <div className="relative w-40 h-40 flex items-center justify-center rounded-full border-8 border-surface-border/50">
                                <div className="absolute inset-0 rounded-full border-8 border-accent border-t-transparent border-l-transparent transform -rotate-45"></div>
                                <div className="text-center">
                                    <p className="text-3xl font-display font-bold text-text-primary">70%</p>
                                    <p className="text-sm font-medium text-text-muted mt-1">Spent</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-text-secondary">Total Spent</span>
                                <span className="font-bold text-text-primary text-base">${totalSpent.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-text-secondary">Total Budget</span>
                                <span className="font-medium text-text-primary">${totalBudget.toLocaleString()}</span>
                            </div>
                            <div className="w-full h-2.5 bg-surface-dim rounded-full mt-3 overflow-hidden">
                                <div className="h-full bg-accent rounded-full shadow-sm" style={{ width: '70%' }}></div>
                            </div>
                        </div>

                        <Link to={`/trips/${activeTrip.id}/budget`} className="mt-8 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary/5 text-primary font-medium hover:bg-primary/10 transition-colors">
                            View Full Budget
                        </Link>
                    </div>

                    <div className="mt-6 bg-primary/5 border border-primary/10 rounded-2xl p-6 text-center shadow-sm">
                        <Globe className="h-8 w-8 text-primary mx-auto mb-3" />
                        <h4 className="font-display font-bold text-primary mb-2">Ready to explore?</h4>
                        <p className="text-sm text-text-secondary mb-4">Discover more cities to add to your itinerary.</p>
                        <Link to="/cities" className="inline-flex items-center text-sm font-bold text-primary hover:text-primary-dark transition-colors">
                            Browse Destinations →
                        </Link>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}

