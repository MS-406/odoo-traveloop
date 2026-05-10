// frontend/src/pages/TripDetailPage.tsx
// Trip overview with stops summary, inline budget, and activity suggestions.

import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Edit, MapPin, Plus, Route, Trash2, DollarSign, FileText, ListChecks, Globe, X, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useTripStore } from "@/stores/tripStore";
import { activitiesApi, type Activity } from "@/api/activities";
import { budgetApi, type BudgetSummary, type BudgetItem } from "@/api/budget";
import StopCard from "@/components/trips/StopCard";
import ShareButton from "@/components/trips/ShareButton";
import AddToTripModal from "@/components/trips/AddToTripModal";
import AddBudgetItemModal from "@/components/budget/AddBudgetItemModal";
import MiniMapPreview from "@/components/map/MiniMapPreview";
import toast from "react-hot-toast";

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeTrip, isTripLoading, fetchTrip, deleteTrip, deleteStop } = useTripStore();
  const [suggestedActivities, setSuggestedActivities] = useState<Activity[]>([]);
  const [removedSuggestionIds, setRemovedSuggestionIds] = useState<Set<string>>(new Set());
  const [activityToAddToTrip, setActivityToAddToTrip] = useState<Activity | null>(null);

  // Budget state
  const [budget, setBudget] = useState<BudgetSummary | null>(null);
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetItemToEdit, setBudgetItemToEdit] = useState<BudgetItem | null>(null);
  const [showBudgetDetails, setShowBudgetDetails] = useState(false);

  useEffect(() => { if (id) fetchTrip(id); }, [id, fetchTrip]);

  const fetchBudget = useCallback(async () => {
    if (!id) return;
    setBudgetLoading(true);
    try {
      const { data } = await budgetApi.get(id);
      setBudget(data);
    } catch { /* silent */ }
    finally { setBudgetLoading(false); }
  }, [id]);

  useEffect(() => { fetchBudget(); }, [fetchBudget]);

  useEffect(() => {
    if (activeTrip?.stops.length) {
      (async () => {
        try {
          const cityIds = [...new Set(activeTrip.stops.map(s => s.city_id))];
          const allSuggestions: Activity[] = [];
          for (const cityId of cityIds.slice(0, 3)) {
            const { data } = await activitiesApi.search({ city_id: cityId, limit: 5 });
            allSuggestions.push(...data.items);
          }
          const addedActivityIds = new Set(
            activeTrip.stops.flatMap(s => (s.stop_activities || []).map(sa => sa.activity_id))
          );
          setSuggestedActivities(
            allSuggestions.filter(a => !addedActivityIds.has(a.id)).slice(0, 10)
          );
        } catch (err) {
          console.error("Failed to load suggestions", err);
        }
      })();
    }
  }, [activeTrip]);

  const handleDelete = async () => {
    if (!id || !confirm("Delete this trip? This cannot be undone.")) return;
    try { await deleteTrip(id); toast.success("Trip deleted"); navigate("/trips"); }
    catch { toast.error("Failed to delete trip"); }
  };

  const handleDeleteStop = async (stopId: string) => {
    if (!confirm("Remove this stop?")) return;
    try { await deleteStop(stopId); toast.success("Stop removed"); fetchBudget(); }
    catch { toast.error("Failed to remove stop"); }
  };

  const removeSuggestion = (activityId: string) => {
    setRemovedSuggestionIds(prev => new Set(prev).add(activityId));
  };

  const handleActivityAdded = () => {
    if (id) fetchTrip(id);
    fetchBudget();
  };

  const handleDeleteBudgetItem = async (itemId: string) => {
    if (!confirm("Remove this expense?")) return;
    try {
      await budgetApi.deleteItem(itemId);
      toast.success("Expense removed");
      fetchBudget();
    } catch { toast.error("Failed to remove"); }
  };

  const handleEditBudgetItem = (item: BudgetItem) => {
    setBudgetItemToEdit(item);
    setShowBudgetModal(true);
  };

  const closeBudgetModal = () => {
    setShowBudgetModal(false);
    setBudgetItemToEdit(null);
  };

  if (isTripLoading || !activeTrip) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const totalBudget = budget ? parseFloat(budget.total_budget) : 0;
  const visibleSuggestions = suggestedActivities.filter(a => !removedSuggestionIds.has(a.id));

  return (
    <div className="min-h-screen bg-surface font-sans pb-24">
      {/* Hero Section */}
      <div className="relative h-72 sm:h-96 w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent overflow-hidden">
            <img src={activeTrip.cover_photo || "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?q=80&w=2000&auto=format&fit=crop"} alt="Destination" className="w-full h-full object-cover opacity-60 mix-blend-overlay" />
        </div>
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          <Link to={`/trips/${activeTrip.id}/builder`} className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-primary text-white hover:bg-primary-dark transition-all shadow-lg shadow-primary/20">
            <Route className="h-6 w-6" />
            <span className="text-sm font-medium text-center">Builder</span>
          </Link>
          <Link to={`/trips/${activeTrip.id}/itinerary`} className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-surface-card border border-surface-border hover:shadow-ambient transition-all text-text-primary group">
            <MapPin className="h-6 w-6 text-accent group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-center">Map View</span>
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
            {/* Main Content Area */}
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
                            {activeTrip.stops.map((stop) => (
                                <div key={stop.id} className="relative">
                                    <div className="absolute -left-[21px] sm:-left-[37px] top-6 w-4 h-4 rounded-full bg-accent border-[3px] border-surface shadow-sm"></div>
                                    <StopCard stop={stop} onDelete={handleDeleteStop} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Suggested Activities */}
                {visibleSuggestions.length > 0 && (
                  <div>
                      <h2 className="text-2xl font-display font-bold text-text-primary mb-6">Suggested Activities</h2>
                      <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
                        {visibleSuggestions.map((act) => (
                              <div key={act.id} className="min-w-[240px] snap-start bg-surface-card border border-surface-border rounded-2xl p-4 shadow-sm hover:shadow-ambient transition-all cursor-pointer group relative">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); removeSuggestion(act.id); }}
                                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white text-text-secondary z-10"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                                <div className="h-32 rounded-xl bg-surface-dim mb-4 overflow-hidden relative">
                                    {act.image_url ? (
                                      <img src={act.image_url} alt={act.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-3xl">🎯</div>
                                    )}
                                    <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors"></div>
                                </div>
                                <h3 className="font-semibold text-text-primary truncate">{act.name}</h3>
                                <div className="flex items-center justify-between mt-3 text-sm text-text-secondary">
                                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3"/> {act.type}</span>
                                    <span className="font-medium text-success">${parseFloat(act.cost).toFixed(0)}</span>
                                </div>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setActivityToAddToTrip(act); }}
                                  className="mt-4 w-full py-2 rounded-lg bg-primary text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5"
                                >
                                  <Plus className="h-3.5 w-3.5" /> Add to Trip
                                </button>
                              </div>
                        ))}
                      </div>
                  </div>
                )}
            </div>

            {/* Sticky Sidebar — Inline Budget */}
            <div className="space-y-6">
                <div className="sticky top-24">
                    <div className="bg-surface-card border border-surface-border rounded-2xl shadow-ambient overflow-hidden">
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-display font-bold text-text-primary">Trip Budget</h3>
                            <button
                              onClick={() => setShowBudgetModal(true)}
                              className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                              title="Add expense"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          
                          {budgetLoading && !budget ? (
                            <div className="flex items-center justify-center py-6">
                              <Loader2 className="h-5 w-5 text-primary animate-spin" />
                            </div>
                          ) : (
                            <>
                              <div className="flex justify-between items-center text-sm mb-3">
                                <span className="text-text-secondary">Total</span>
                                <span className="font-bold text-text-primary text-2xl">${totalBudget.toLocaleString()}</span>
                              </div>
                              {budget && budget.cost_per_day && (
                                <p className="text-xs text-text-muted mb-4">
                                  ~${parseFloat(budget.cost_per_day).toFixed(0)}/day · {budget.trip_duration_days} days
                                </p>
                              )}

                              {/* Category breakdown pills */}
                              {budget && budget.category_breakdown.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                  {budget.category_breakdown.map(cat => (
                                    <span key={cat.category} className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-primary/5 text-primary/70">
                                      {cat.category} ${parseFloat(cat.total_cost).toFixed(0)}
                                    </span>
                                  ))}
                                </div>
                              )}

                              <button
                                onClick={() => setShowBudgetDetails(!showBudgetDetails)}
                                className="w-full text-center text-xs font-bold text-primary hover:text-primary-dark transition-colors py-2"
                              >
                                {showBudgetDetails ? "Hide Details ▲" : "Show Details ▼"}
                              </button>
                            </>
                          )}
                        </div>

                        {/* Expandable detail section */}
                        {showBudgetDetails && budget && (
                          <div className="border-t border-surface-border max-h-[400px] overflow-y-auto">
                            {/* Manual Items */}
                            <div className="px-4 py-3">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">Manual Expenses</p>
                              {budget.manual_items.length === 0 ? (
                                <p className="text-xs text-text-muted py-3 text-center">No expenses yet. Click + to add.</p>
                              ) : (
                                <div className="space-y-2">
                                  {budget.manual_items.map(item => (
                                    <div key={item.id} className="flex items-center justify-between py-1.5 group/item">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <DollarSign className="h-3 w-3 text-primary shrink-0" />
                                        <div className="min-w-0">
                                          <p className="text-xs font-medium text-text-primary truncate">{item.title}</p>
                                          <p className="text-[10px] text-text-muted">{item.category}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1 shrink-0">
                                        <span className="text-xs font-bold text-text-primary">${parseFloat(item.amount).toLocaleString()}</span>
                                        <button onClick={() => handleEditBudgetItem(item)} className="p-1 rounded text-primary opacity-0 group-hover/item:opacity-100 hover:bg-primary/5 transition-all">
                                          <Edit className="h-3 w-3" />
                                        </button>
                                        <button onClick={() => handleDeleteBudgetItem(item.id)} className="p-1 rounded text-danger opacity-0 group-hover/item:opacity-100 hover:bg-danger/5 transition-all">
                                          <Trash2 className="h-3 w-3" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Activity costs by stop */}
                            {budget.stop_breakdown.length > 0 && (
                              <div className="px-4 py-3 border-t border-surface-border">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">Activity Costs by City</p>
                                <div className="space-y-1.5">
                                  {budget.stop_breakdown.filter(s => s.activity_count > 0).map(s => (
                                    <div key={s.stop_id} className="flex items-center justify-between text-xs">
                                      <span className="text-text-secondary">{s.city_name} <span className="text-text-muted">({s.activity_count})</span></span>
                                      <span className="font-bold text-text-primary">${parseFloat(s.total_cost).toFixed(0)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                    </div>

                    <div className="mt-6 bg-primary/5 border border-primary/10 rounded-2xl p-6 text-center shadow-sm">
                        <Globe className="h-8 w-8 text-primary mx-auto mb-3" />
                        <h4 className="font-display font-bold text-primary mb-2">Ready to explore?</h4>
                        <p className="text-sm text-text-secondary mb-4">Discover more cities to add to your itinerary.</p>
                        <Link to="/cities" className="inline-flex items-center text-sm font-bold text-primary hover:text-primary-dark transition-colors">
                            Browse Destinations →
                        </Link>
                    </div>

                    {/* Mini Map Preview */}
                    {activeTrip.stops.length > 0 && (
                      <div className="mt-6">
                        <MiniMapPreview tripId={activeTrip.id} />
                      </div>
                    )}
                </div>
            </div>
        </div>

        {activityToAddToTrip && (
          <AddToTripModal 
            activity={activityToAddToTrip} 
            isOpen={!!activityToAddToTrip} 
            onClose={() => { setActivityToAddToTrip(null); handleActivityAdded(); }} 
          />
        )}

        <AddBudgetItemModal
          tripId={id || ""}
          isOpen={showBudgetModal}
          onClose={closeBudgetModal}
          onSuccess={fetchBudget}
          itemToEdit={budgetItemToEdit}
        />

      </div>
    </div>
  );
}
