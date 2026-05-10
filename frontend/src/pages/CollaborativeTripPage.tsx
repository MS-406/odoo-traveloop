// frontend/src/pages/CollaborativeTripPage.tsx
// List page for collaborative trips — create, join, view all.

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users2, Plus, Loader2, MapPin, Calendar, Crown, Pencil, Eye, LogIn,
} from "lucide-react";
import toast from "react-hot-toast";
import { useCollaborativeStore } from "@/stores/collaborativeStore";

const ROLE_ICON: Record<string, typeof Crown> = { owner: Crown, editor: Pencil, viewer: Eye };
const ROLE_COLOR: Record<string, string> = {
  owner: "bg-amber-100 text-amber-700",
  editor: "bg-indigo-100 text-indigo-700",
  viewer: "bg-gray-100 text-gray-600",
};

export default function CollaborativeTripPage() {
  const navigate = useNavigate();
  const { trips, isLoading, fetchTrips, createTrip, joinTrip } = useCollaborativeStore();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const handleCreate = async () => {
    if (!title.trim()) { toast.error("Enter a trip title"); return; }
    setSubmitting(true);
    try {
      const trip = await createTrip({ title: title.trim(), description: description.trim() || undefined });
      toast.success("Trip created!");
      setShowCreate(false);
      setTitle("");
      setDescription("");
      navigate(`/collaborative-trip/${trip.id}`);
    } catch {
      toast.error("Failed to create trip");
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) { toast.error("Enter an invite code"); return; }
    setSubmitting(true);
    try {
      const tripId = await joinTrip(inviteCode.trim());
      toast.success("Joined trip!");
      setShowJoin(false);
      setInviteCode("");
      navigate(`/collaborative-trip/${tripId}`);
    } catch {
      toast.error("Invalid invite code");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
              <Users2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Collaborative Trips</h1>
              <p className="text-sm text-text-secondary">Plan together with friends & family</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setShowJoin(true); setShowCreate(false); }}
              className="px-3 py-2 rounded-lg border border-surface-border text-sm font-medium text-text-secondary hover:text-text-primary hover:border-primary/30 transition flex items-center gap-1.5"
            >
              <LogIn className="h-4 w-4" /> Join
            </button>
            <button
              onClick={() => { setShowCreate(true); setShowJoin(false); }}
              className="px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium shadow hover:shadow-lg transition flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" /> Create
            </button>
          </div>
        </div>

        {/* Create modal */}
        {showCreate && (
          <div className="glass-card p-5 mb-6 border-2 border-emerald-200 animate-in fade-in">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Create Collaborative Trip</h3>
            <div className="space-y-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Trip title (e.g. Summer Euro Trip 2026)"
                className="w-full px-3 py-2 rounded-lg bg-surface border border-surface-border text-text-primary text-sm focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 outline-none transition"
                autoFocus
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optional)"
                rows={2}
                className="w-full px-3 py-2 rounded-lg bg-surface border border-surface-border text-text-primary text-sm focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 outline-none transition resize-none"
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowCreate(false)} className="px-3 py-1.5 rounded-lg text-sm text-text-secondary hover:text-text-primary transition">Cancel</button>
                <button onClick={handleCreate} disabled={submitting} className="px-4 py-1.5 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition disabled:opacity-60">
                  {submitting ? "Creating…" : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Join modal */}
        {showJoin && (
          <div className="glass-card p-5 mb-6 border-2 border-indigo-200 animate-in fade-in">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Join with Invite Code</h3>
            <div className="flex gap-2">
              <input
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleJoin(); }}
                placeholder="e.g. TRVL-AB12-CD34"
                className="flex-1 px-3 py-2 rounded-lg bg-surface border border-surface-border text-text-primary text-sm font-mono focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-400 outline-none transition"
                autoFocus
              />
              <button onClick={() => setShowJoin(false)} className="px-3 py-1.5 rounded-lg text-sm text-text-secondary hover:text-text-primary transition">Cancel</button>
              <button onClick={handleJoin} disabled={submitting} className="px-4 py-1.5 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition disabled:opacity-60">
                {submitting ? "Joining…" : "Join"}
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && trips.length === 0 && (
          <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-600/10 mb-4">
              <Users2 className="h-12 w-12 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">No Collaborative Trips Yet</h3>
            <p className="text-sm text-text-secondary max-w-sm mb-4">
              Create a new trip and invite friends, or join an existing trip with an invite code.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setShowJoin(true)} className="px-4 py-2 rounded-lg border border-surface-border text-sm font-medium text-text-secondary hover:text-text-primary transition flex items-center gap-1.5">
                <LogIn className="h-4 w-4" /> Join Trip
              </button>
              <button onClick={() => setShowCreate(true)} className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition flex items-center gap-1.5">
                <Plus className="h-4 w-4" /> Create Trip
              </button>
            </div>
          </div>
        )}

        {/* Trip cards */}
        {!isLoading && trips.length > 0 && (
          <div className="grid gap-3">
            {trips.map((trip) => {
              const RoleIcon = ROLE_ICON[trip.my_role || "viewer"] || Eye;
              const roleColor = ROLE_COLOR[trip.my_role || "viewer"];
              return (
                <Link
                  key={trip.id}
                  to={`/collaborative-trip/${trip.id}`}
                  className="glass-card p-4 flex items-center justify-between hover:shadow-lg hover:border-primary/20 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-600/10 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary group-hover:text-primary transition">{trip.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-text-muted mt-0.5">
                        <span className="flex items-center gap-1"><Users2 className="h-3 w-3" /> {trip.member_count} members</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {trip.stop_count} stops</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(trip.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${roleColor}`}>
                      <RoleIcon className="h-3 w-3" />
                      {trip.my_role}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      trip.status === "planning" ? "bg-blue-100 text-blue-700" :
                      trip.status === "finalized" ? "bg-emerald-100 text-emerald-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {trip.status}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
