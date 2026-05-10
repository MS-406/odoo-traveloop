// frontend/src/pages/AiTripOptimizerPage.tsx
// AI-powered trip route optimizer — form + results layout.

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  Sparkles, Plane, Train, Bus, Car, Shuffle, DollarSign, Clock, MapPin,
  Lightbulb, AlertTriangle, TrendingDown, X, Plus, ChevronRight, BarChart3,
  Hotel, Ticket, ArrowRight,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import toast from "react-hot-toast";
import { aiOptimizerApi, OptimizationResult, OptimizeRequest } from "@/api/aiOptimizer";

type FormData = {
  starting_city: string;
  travelers: number;
  budget_usd: number;
  transport_preference: "flight" | "train" | "bus" | "car" | "mixed";
  travel_style: "budget" | "medium" | "luxury";
  start_date: string;
  end_date: string;
  priority: "cheapest" | "fastest" | "balanced" | "scenic";
};

const LOADING_MESSAGES = [
  "Analyzing your route…",
  "Calculating transport costs…",
  "Finding hidden gems…",
  "Optimizing stop order…",
  "Estimating accommodation…",
  "Crafting your perfect trip…",
];

const TRANSPORT_ICONS: Record<string, typeof Plane> = {
  flight: Plane, train: Train, bus: Bus, car: Car, mixed: Shuffle,
};

const PIE_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#f43f5e"];

export default function AiTripOptimizerPage() {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState<string[]>([]);
  const [destInput, setDestInput] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      travelers: 1,
      budget_usd: 2000,
      transport_preference: "mixed",
      travel_style: "medium",
      priority: "balanced",
    },
  });

  // Cycling loading messages
  useEffect(() => {
    if (status !== "loading") return;
    const interval = setInterval(() => {
      setLoadingMsg((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [status]);

  const addDestination = useCallback(() => {
    const v = destInput.trim();
    if (v && !destinations.includes(v) && destinations.length < 10) {
      setDestinations((prev) => [...prev, v]);
      setDestInput("");
    }
  }, [destInput, destinations]);

  const addInterest = useCallback(() => {
    const v = interestInput.trim();
    if (v && !interests.includes(v) && interests.length < 10) {
      setInterests((prev) => [...prev, v]);
      setInterestInput("");
    }
  }, [interestInput, interests]);

  const onSubmit = async (data: FormData) => {
    if (destinations.length === 0) {
      toast.error("Add at least one destination city");
      return;
    }
    const endD = new Date(data.end_date);
    const startD = new Date(data.start_date);
    if (endD <= startD) {
      toast.error("End date must be after start date");
      return;
    }

    setStatus("loading");
    setLoadingMsg(0);
    try {
      const payload: OptimizeRequest = {
        ...data,
        destination_cities: destinations,
        interests,
      };
      const { data: res } = await aiOptimizerApi.optimize(payload);
      setResult(res);
      setStatus("success");
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "AI optimization failed. Please try again.";
      setErrorMsg(msg);
      setStatus("error");
      toast.error(msg, { id: "ai-optimizer-error" });
    }
  };

  const handleAddToTrips = () => {
    if (!result) return;
    const cities = result.optimized_route.map((r) => r.city).join(" → ");
    const name = `AI Optimized: ${cities}`;
    navigate(`/trips/new?name=${encodeURIComponent(name)}`);
  };

  const budgetData = result
    ? [
        { name: "Transport", value: result.budget_breakdown.transport, color: PIE_COLORS[0] },
        { name: "Accommodation", value: result.budget_breakdown.accommodation, color: PIE_COLORS[1] },
        { name: "Activities", value: result.budget_breakdown.activities, color: PIE_COLORS[2] },
        { name: "Meals", value: result.budget_breakdown.meals, color: PIE_COLORS[3] },
      ]
    : [];

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">AI Trip Optimizer</h1>
            <p className="text-sm text-text-secondary">Let AI craft your perfect multi-city route</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ── LEFT: Form ────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-5 space-y-4">
              {/* Starting City */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Starting City</label>
                <input
                  {...register("starting_city", { required: "Required", minLength: 2 })}
                  placeholder="e.g. New York"
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-surface-border text-text-primary text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition"
                />
                {errors.starting_city && <p className="text-xs text-danger mt-1">{errors.starting_city.message}</p>}
              </div>

              {/* Destinations (tag input) */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Destination Cities <span className="text-text-muted">({destinations.length}/10)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    value={destInput}
                    onChange={(e) => setDestInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addDestination(); } }}
                    placeholder="Type & press Enter"
                    className="flex-1 px-3 py-2 rounded-lg bg-surface border border-surface-border text-text-primary text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition"
                  />
                  <button type="button" onClick={addDestination} className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {destinations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {destinations.map((d) => (
                      <span key={d} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {d}
                        <button type="button" onClick={() => setDestinations((p) => p.filter((x) => x !== d))} className="hover:text-danger transition">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Travelers & Budget */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Travelers</label>
                  <input
                    type="number"
                    {...register("travelers", { required: true, min: 1, max: 20, valueAsNumber: true })}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-surface-border text-text-primary text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Budget (USD)</label>
                  <input
                    type="number"
                    {...register("budget_usd", { required: true, min: 100, valueAsNumber: true })}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-surface-border text-text-primary text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Start Date</label>
                  <input
                    type="date"
                    {...register("start_date", { required: true })}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-surface-border text-text-primary text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">End Date</label>
                  <input
                    type="date"
                    {...register("end_date", { required: true })}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-surface-border text-text-primary text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition"
                  />
                </div>
              </div>

              {/* Transport */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Transport</label>
                <select
                  {...register("transport_preference")}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-surface-border text-text-primary text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition"
                >
                  <option value="mixed">Mixed (Best combo)</option>
                  <option value="flight">Flights only</option>
                  <option value="train">Trains only</option>
                  <option value="bus">Bus only</option>
                  <option value="car">Car / Drive</option>
                </select>
              </div>

              {/* Style & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Travel Style</label>
                  <select
                    {...register("travel_style")}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-surface-border text-text-primary text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition"
                  >
                    <option value="budget">Budget</option>
                    <option value="medium">Mid-range</option>
                    <option value="luxury">Luxury</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Priority</label>
                  <select
                    {...register("priority")}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-surface-border text-text-primary text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition"
                  >
                    <option value="balanced">Balanced</option>
                    <option value="cheapest">Cheapest</option>
                    <option value="fastest">Fastest</option>
                    <option value="scenic">Most Scenic</option>
                  </select>
                </div>
              </div>

              {/* Interests */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Interests <span className="text-text-muted">(optional)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addInterest(); } }}
                    placeholder="e.g. museums, food, hiking"
                    className="flex-1 px-3 py-2 rounded-lg bg-surface border border-surface-border text-text-primary text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition"
                  />
                  <button type="button" onClick={addInterest} className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {interests.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {interests.map((i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
                        {i}
                        <button type="button" onClick={() => setInterests((p) => p.filter((x) => x !== i))} className="hover:text-danger transition">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {status === "loading" ? "Optimizing…" : "Optimize My Trip"}
              </button>
            </form>
          </div>

          {/* ── RIGHT: Results ────────────────────────────────── */}
          <div className="lg:col-span-3">
            {/* Idle */}
            {status === "idle" && (
              <div className="glass-card p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-600/10 mb-4">
                  <Sparkles className="h-12 w-12 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Ready to Optimize</h3>
                <p className="text-sm text-text-secondary max-w-sm">
                  Fill in your trip details and let AI find the best route, estimate costs, and suggest activities for each stop.
                </p>
              </div>
            )}

            {/* Loading */}
            {status === "loading" && (
              <div className="glass-card p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="relative mb-6">
                  <div className="h-16 w-16 rounded-full border-4 border-indigo-200 border-t-indigo-500 animate-spin" />
                  <Sparkles className="h-6 w-6 text-indigo-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">AI is Thinking…</h3>
                <p className="text-sm text-text-secondary animate-pulse transition-all" key={loadingMsg}>
                  {LOADING_MESSAGES[loadingMsg]}
                </p>
              </div>
            )}

            {/* Error */}
            {status === "error" && (
              <div className="glass-card p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="p-4 rounded-2xl bg-danger/10 mb-4">
                  <AlertTriangle className="h-12 w-12 text-danger" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Optimization Failed</h3>
                <p className="text-sm text-text-secondary mb-4 max-w-sm">{errorMsg}</p>
                <button
                  onClick={() => setStatus("idle")}
                  className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Success */}
            {status === "success" && result && (
              <div className="space-y-4">
                {/* Summary bar */}
                <div className="glass-card p-4">
                  <div className="flex flex-wrap items-center gap-4 justify-between">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                        <div>
                          <p className="text-xs text-text-muted">Total Cost</p>
                          <p className="text-lg font-bold text-text-primary">${result.total_estimated_cost_usd.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="w-px h-10 bg-surface-border" />
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-indigo-500" />
                        <div>
                          <p className="text-xs text-text-muted">Total Days</p>
                          <p className="text-lg font-bold text-text-primary">{result.total_days}</p>
                        </div>
                      </div>
                      <div className="w-px h-10 bg-surface-border" />
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-emerald-500" />
                        <div>
                          <p className="text-xs text-text-muted">Savings</p>
                          <p className="text-lg font-bold text-emerald-500">{result.savings_vs_unoptimized_pct}%</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleAddToTrips}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium hover:shadow-lg transition flex items-center gap-1.5"
                    >
                      <Plus className="h-4 w-4" /> Add to My Trips
                    </button>
                  </div>
                  <p className="text-sm text-text-secondary mt-3">{result.optimization_summary}</p>
                </div>

                {/* Route cards */}
                <div className="space-y-3">
                  {result.optimized_route.map((stop, idx) => {
                    const TransportIcon = TRANSPORT_ICONS[stop.transport_from_previous] || Plane;
                    return (
                      <div key={idx} className="glass-card p-4 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-bold">
                              {stop.order}
                            </span>
                            <div>
                              <h4 className="font-semibold text-text-primary flex items-center gap-1.5">
                                <MapPin className="h-4 w-4 text-primary" />
                                {stop.city}, {stop.country}
                              </h4>
                              <p className="text-xs text-text-muted">{stop.days_recommended} days • {stop.best_stay_type}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {idx > 0 && (
                              <div className="flex items-center gap-1 text-xs text-text-secondary mb-1">
                                <TransportIcon className="h-3.5 w-3.5" />
                                <span>{stop.transport_duration_hours}h • ${stop.transport_cost_usd}</span>
                              </div>
                            )}
                            <p className="text-sm font-semibold text-emerald-600">${stop.estimated_cost_usd}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs font-medium text-text-secondary mb-1.5 flex items-center gap-1"><Ticket className="h-3 w-3" /> Top Activities</p>
                            <div className="space-y-1">
                              {stop.best_activities.map((a, i) => (
                                <p key={i} className="text-xs text-text-primary flex items-center gap-1.5">
                                  <ChevronRight className="h-3 w-3 text-primary" />{a}
                                </p>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-4 text-xs text-text-secondary mb-1.5">
                              <span className="flex items-center gap-1"><Hotel className="h-3 w-3" /> ~${stop.estimated_stay_cost_per_night}/night</span>
                            </div>
                            <div className="flex items-start gap-1.5 mt-2 p-2 rounded-lg bg-amber-50 border border-amber-100">
                              <Lightbulb className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-amber-800">{stop.local_tips}</p>
                            </div>
                          </div>
                        </div>

                        {idx < result.optimized_route.length - 1 && (
                          <div className="flex justify-center mt-3 -mb-7 relative z-10">
                            <div className="p-1.5 rounded-full bg-surface-card border border-surface-border shadow-sm">
                              <ArrowRight className="h-3.5 w-3.5 text-text-muted rotate-90" />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Budget pie + warnings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="glass-card p-4">
                    <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-1.5">
                      <BarChart3 className="h-4 w-4 text-primary" /> Budget Breakdown
                    </h4>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={budgetData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            dataKey="value"
                            paddingAngle={3}
                            stroke="none"
                          >
                            {budgetData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                            contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {budgetData.map((d) => (
                        <div key={d.name} className="flex items-center gap-2 text-xs">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                          <span className="text-text-secondary">{d.name}</span>
                          <span className="ml-auto font-medium text-text-primary">${d.value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Warnings */}
                    {result.warnings.length > 0 && (
                      <div className="glass-card p-4">
                        <h4 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-1.5">
                          <AlertTriangle className="h-4 w-4 text-amber-500" /> Warnings
                        </h4>
                        <ul className="space-y-1.5">
                          {result.warnings.map((w, i) => (
                            <li key={i} className="text-xs text-text-secondary flex items-start gap-1.5">
                              <span className="text-amber-500 mt-0.5">•</span>{w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Alternative suggestion */}
                    {result.alternative_suggestion && (
                      <div className="glass-card p-4 bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
                        <h4 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-1.5">
                          <Lightbulb className="h-4 w-4 text-indigo-500" /> Alternative
                        </h4>
                        <p className="text-xs text-text-secondary">{result.alternative_suggestion}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
