// frontend/src/pages/CollaborativeTripWorkspace.tsx
// Full workspace for a single collaborative trip — stops, members, comments, polling.

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Users2, Loader2, MapPin, Plus, Trash2, ThumbsUp, ThumbsDown, HelpCircle,
  Crown, Pencil, Eye, Send, Copy, Check, ChevronDown, LogOut,
  MessageCircle, X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useCollaborativeStore } from "@/stores/collaborativeStore";
import { useAuthStore } from "@/stores/authStore";

const ROLE_ICON: Record<string, typeof Crown> = { owner: Crown, editor: Pencil, viewer: Eye };
const ROLE_COLOR: Record<string, string> = {
  owner: "bg-amber-100 text-amber-700",
  editor: "bg-indigo-100 text-indigo-700",
  viewer: "bg-gray-100 text-gray-600",
};

export default function CollaborativeTripWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    activeTrip, isWorkspaceLoading, fetchTrip, addStop, deleteStop, vote,
    addComment, leaveTrip, deleteTrip, removeMember, changeRole, pollForUpdates,
  } = useCollaborativeStore();

  const [showInvite, setShowInvite] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAddStop, setShowAddStop] = useState(false);
  const [cityName, setCityName] = useState("");
  const [country, setCountry] = useState("");
  const [stopNotes, setStopNotes] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mobileTab, setMobileTab] = useState<"stops" | "members">("stops");
  const [isLive, setIsLive] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (id) fetchTrip(id);
  }, [id, fetchTrip]);

  // Polling every 10s
  useEffect(() => {
    if (!id) return;
    const poll = async () => {
      const changed = await pollForUpdates(id);
      if (changed) {
        await fetchTrip(id);
      }
      setIsLive(true);
    };

    pollRef.current = setInterval(poll, 10000);

    // Also poll on tab focus
    const handleVisibility = () => {
      if (!document.hidden && id) {
        poll();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [id, pollForUpdates, fetchTrip]);

  const copyInvite = useCallback(() => {
    if (!activeTrip) return;
    navigator.clipboard.writeText(activeTrip.invite_code);
    setCopied(true);
    toast.success("Invite code copied!");
    setTimeout(() => setCopied(false), 2000);
  }, [activeTrip]);

  const handleAddStop = async () => {
    if (!id || !cityName.trim()) { toast.error("Enter a city name"); return; }
    setSubmitting(true);
    try {
      await addStop(id, {
        city_name: cityName.trim(),
        country: country.trim() || undefined,
        notes: stopNotes.trim() || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        position_order: activeTrip?.stops.length || 0,
      });
      toast.success("Stop added!");
      setCityName(""); setCountry(""); setStopNotes(""); setStartDate(""); setEndDate("");
      setShowAddStop(false);
    } catch {
      toast.error("Failed to add stop");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStop = async (stopId: string) => {
    if (!id) return;
    try {
      await deleteStop(id, stopId);
      toast.success("Stop removed");
    } catch {
      toast.error("Failed to delete stop");
    }
  };

  const handleVote = async (stopId: string, v: "yes" | "no" | "maybe") => {
    if (!id) return;
    try { await vote(id, stopId, v); } catch { toast.error("Vote failed"); }
  };

  const handleComment = async () => {
    if (!id || !commentText.trim()) return;
    setSubmitting(true);
    try {
      await addComment(id, commentText.trim());
      setCommentText("");
    } catch {
      toast.error("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLeave = async () => {
    if (!id) return;
    if (!confirm("Leave this trip?")) return;
    try {
      await leaveTrip(id);
      toast.success("Left the trip");
      navigate("/collaborative-trip");
    } catch {
      toast.error("Cannot leave (owners can't leave)");
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm("Delete this trip? This cannot be undone.")) return;
    try {
      await deleteTrip(id);
      toast.success("Trip deleted");
      navigate("/collaborative-trip");
    } catch {
      toast.error("Failed to delete trip");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!id) return;
    if (!confirm("Remove this member?")) return;
    try {
      await removeMember(id, userId);
      toast.success("Member removed");
    } catch {
      toast.error("Failed to remove member");
    }
  };

  const handleChangeRole = async (userId: string, role: string) => {
    if (!id) return;
    try {
      await changeRole(id, userId, role);
      toast.success("Role updated");
    } catch {
      toast.error("Failed to change role");
    }
  };

  if (isWorkspaceLoading || !activeTrip) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  const isOwner = activeTrip.my_role === "owner";
  const canEdit = activeTrip.my_role === "owner" || activeTrip.my_role === "editor";

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/collaborative-trip")} className="p-2 rounded-lg hover:bg-surface-card transition">
              <ArrowLeft className="h-4 w-4 text-text-secondary" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <Users2 className="h-5 w-5 text-emerald-500" />
                {activeTrip.title}
              </h1>
              {activeTrip.description && <p className="text-xs text-text-muted mt-0.5">{activeTrip.description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Live indicator */}
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-text-muted">
              <span className={`h-2 w-2 rounded-full ${isLive ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`} />
              {isLive ? "Live" : "Offline"} • {activeTrip.member_count} members
            </span>
            <button
              onClick={() => setShowInvite(!showInvite)}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 transition flex items-center gap-1"
            >
              <Users2 className="h-3.5 w-3.5" /> Invite
            </button>
            {isOwner ? (
              <button onClick={handleDelete} className="px-3 py-1.5 rounded-lg border border-danger/30 text-danger text-xs font-medium hover:bg-danger/5 transition flex items-center gap-1">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            ) : (
              <button onClick={handleLeave} className="px-3 py-1.5 rounded-lg border border-surface-border text-text-secondary text-xs font-medium hover:text-danger hover:border-danger/30 transition flex items-center gap-1">
                <LogOut className="h-3.5 w-3.5" /> Leave
              </button>
            )}
          </div>
        </div>

        {/* Invite modal */}
        {showInvite && (
          <div className="glass-card p-4 mb-4 border-2 border-emerald-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-text-primary">Invite Code</h3>
              <button onClick={() => setShowInvite(false)} className="p-1 rounded hover:bg-surface transition"><X className="h-4 w-4 text-text-muted" /></button>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 rounded-lg bg-surface border border-surface-border text-sm font-mono text-text-primary tracking-wider">
                {activeTrip.invite_code}
              </code>
              <button
                onClick={copyInvite}
                className="px-3 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition flex items-center gap-1"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="text-xs text-text-muted mt-2">Share this code with friends so they can join your trip.</p>
          </div>
        )}

        {/* Mobile tabs */}
        <div className="lg:hidden flex border-b border-surface-border mb-4">
          <button
            onClick={() => setMobileTab("stops")}
            className={`flex-1 py-2.5 text-sm font-medium text-center transition ${mobileTab === "stops" ? "text-primary border-b-2 border-primary" : "text-text-muted"}`}
          >
            Stops ({activeTrip.stops.length})
          </button>
          <button
            onClick={() => setMobileTab("members")}
            className={`flex-1 py-2.5 text-sm font-medium text-center transition ${mobileTab === "members" ? "text-primary border-b-2 border-primary" : "text-text-muted"}`}
          >
            Members & Chat
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* ── Left: Stops ─────────────────────────────────────── */}
          <div className={`lg:col-span-3 ${mobileTab !== "stops" ? "hidden lg:block" : ""}`}>
            {/* Add stop */}
            {canEdit && (
              <div className="mb-3">
                {!showAddStop ? (
                  <button
                    onClick={() => setShowAddStop(true)}
                    className="w-full py-2.5 rounded-xl border-2 border-dashed border-surface-border text-sm font-medium text-text-muted hover:border-emerald-300 hover:text-emerald-600 transition flex items-center justify-center gap-1.5"
                  >
                    <Plus className="h-4 w-4" /> Add Stop
                  </button>
                ) : (
                  <div className="glass-card p-4 border-2 border-emerald-200">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <input value={cityName} onChange={(e) => setCityName(e.target.value)} placeholder="City name *" autoFocus
                        className="px-3 py-2 rounded-lg bg-surface border border-surface-border text-text-primary text-sm focus:ring-2 focus:ring-emerald-400/40 outline-none transition" />
                      <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country"
                        className="px-3 py-2 rounded-lg bg-surface border border-surface-border text-text-primary text-sm focus:ring-2 focus:ring-emerald-400/40 outline-none transition" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="Start date"
                        className="px-3 py-2 rounded-lg bg-surface border border-surface-border text-text-primary text-sm focus:ring-2 focus:ring-emerald-400/40 outline-none transition" />
                      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="End date"
                        className="px-3 py-2 rounded-lg bg-surface border border-surface-border text-text-primary text-sm focus:ring-2 focus:ring-emerald-400/40 outline-none transition" />
                    </div>
                    <textarea value={stopNotes} onChange={(e) => setStopNotes(e.target.value)} placeholder="Notes (optional)" rows={2}
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-surface-border text-text-primary text-sm focus:ring-2 focus:ring-emerald-400/40 outline-none transition resize-none mb-3" />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setShowAddStop(false)} className="px-3 py-1.5 rounded-lg text-sm text-text-secondary hover:text-text-primary transition">Cancel</button>
                      <button onClick={handleAddStop} disabled={submitting} className="px-4 py-1.5 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition disabled:opacity-60">
                        {submitting ? "Adding…" : "Add Stop"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Stops list */}
            {activeTrip.stops.length === 0 ? (
              <div className="glass-card p-10 flex flex-col items-center text-center">
                <MapPin className="h-10 w-10 text-text-muted mb-3" />
                <p className="text-sm text-text-secondary">No stops yet. Add the first destination!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeTrip.stops.map((stop) => {
                  const myVote = stop.votes.find((v) => v.user_id === user?.id)?.vote;
                  const totalVotes = stop.vote_summary.yes + stop.vote_summary.no + stop.vote_summary.maybe;
                  return (
                    <div key={stop.id} className="glass-card p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-text-primary flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-emerald-500" />
                            {stop.city_name}{stop.country ? `, ${stop.country}` : ""}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
                            {stop.start_date && stop.end_date && (
                              <span>{new Date(stop.start_date).toLocaleDateString()} → {new Date(stop.end_date).toLocaleDateString()}</span>
                            )}
                            {stop.added_by_name && <span>Added by {stop.added_by_name}</span>}
                          </div>
                        </div>
                        {canEdit && (
                          <button onClick={() => handleDeleteStop(stop.id)} className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/5 transition">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      {stop.notes && (
                        <p className="text-xs text-text-secondary mb-3 p-2 rounded-lg bg-surface">{stop.notes}</p>
                      )}

                      {/* Votes */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleVote(stop.id, "yes")}
                            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition ${
                              myVote === "yes" ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300" : "hover:bg-emerald-50 text-text-muted"
                            }`}
                          >
                            <ThumbsUp className="h-3.5 w-3.5" /> {stop.vote_summary.yes}
                          </button>
                          <button
                            onClick={() => handleVote(stop.id, "no")}
                            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition ${
                              myVote === "no" ? "bg-red-100 text-red-700 ring-1 ring-red-300" : "hover:bg-red-50 text-text-muted"
                            }`}
                          >
                            <ThumbsDown className="h-3.5 w-3.5" /> {stop.vote_summary.no}
                          </button>
                          <button
                            onClick={() => handleVote(stop.id, "maybe")}
                            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition ${
                              myVote === "maybe" ? "bg-amber-100 text-amber-700 ring-1 ring-amber-300" : "hover:bg-amber-50 text-text-muted"
                            }`}
                          >
                            <HelpCircle className="h-3.5 w-3.5" /> {stop.vote_summary.maybe}
                          </button>
                        </div>

                        {/* Mini vote bar */}
                        {totalVotes > 0 && (
                          <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden flex">
                            {stop.vote_summary.yes > 0 && (
                              <div className="bg-emerald-500 h-full transition-all" style={{ width: `${(stop.vote_summary.yes / totalVotes) * 100}%` }} />
                            )}
                            {stop.vote_summary.maybe > 0 && (
                              <div className="bg-amber-400 h-full transition-all" style={{ width: `${(stop.vote_summary.maybe / totalVotes) * 100}%` }} />
                            )}
                            {stop.vote_summary.no > 0 && (
                              <div className="bg-red-400 h-full transition-all" style={{ width: `${(stop.vote_summary.no / totalVotes) * 100}%` }} />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom status */}
            <div className="flex items-center gap-2 mt-4 text-xs text-text-muted">
              <span className={`h-2 w-2 rounded-full ${isLive ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`} />
              {isLive ? "Live" : "Offline"} • {activeTrip.member_count} members • Last updated {new Date(activeTrip.updated_at).toLocaleTimeString()}
            </div>
          </div>

          {/* ── Right: Members + Comments ───────────────────────── */}
          <div className={`lg:col-span-2 space-y-4 ${mobileTab !== "members" ? "hidden lg:block" : ""}`}>
            {/* Members */}
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-1.5">
                <Users2 className="h-4 w-4 text-emerald-500" /> Members ({activeTrip.members.length})
              </h3>
              <div className="space-y-2">
                {activeTrip.members.map((member) => {
                  const RoleIcon = ROLE_ICON[member.role] || Eye;
                  const roleColor = ROLE_COLOR[member.role];
                  const isMe = member.user_id === user?.id;
                  return (
                    <div key={member.id} className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                          {member.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">
                            {member.full_name} {isMe && <span className="text-text-muted">(you)</span>}
                          </p>
                          <p className="text-xs text-text-muted">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium ${roleColor}`}>
                          <RoleIcon className="h-3 w-3" /> {member.role}
                        </span>
                        {isOwner && !isMe && member.role !== "owner" && (
                          <div className="relative group">
                            <button className="p-1 rounded hover:bg-surface transition">
                              <ChevronDown className="h-3.5 w-3.5 text-text-muted" />
                            </button>
                            <div className="absolute right-0 top-full mt-1 bg-white border border-surface-border rounded-lg shadow-lg py-1 w-32 hidden group-hover:block z-20">
                              <button onClick={() => handleChangeRole(member.user_id, member.role === "editor" ? "viewer" : "editor")}
                                className="w-full px-3 py-1.5 text-xs text-left hover:bg-surface transition">
                                Make {member.role === "editor" ? "Viewer" : "Editor"}
                              </button>
                              <button onClick={() => handleRemoveMember(member.user_id)}
                                className="w-full px-3 py-1.5 text-xs text-left text-danger hover:bg-danger/5 transition">
                                Remove
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Comments */}
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-1.5">
                <MessageCircle className="h-4 w-4 text-indigo-500" /> Chat
              </h3>

              {/* Comment input */}
              <div className="flex gap-2 mb-3">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleComment(); } }}
                  placeholder="Type a message…"
                  className="flex-1 px-3 py-2 rounded-lg bg-surface border border-surface-border text-text-primary text-sm focus:ring-2 focus:ring-indigo-400/40 outline-none transition"
                />
                <button
                  onClick={handleComment}
                  disabled={submitting || !commentText.trim()}
                  className="p-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>

              {/* Comment list */}
              <div className="space-y-2.5 max-h-80 overflow-y-auto">
                {activeTrip.comments.length === 0 ? (
                  <p className="text-xs text-text-muted text-center py-4">No messages yet. Start the conversation!</p>
                ) : (
                  [...activeTrip.comments].reverse().map((c) => {
                    const isMe = c.user_id === user?.id;
                    return (
                      <div key={c.id} className={`flex gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                          {c.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div className={`max-w-[80%] ${isMe ? "text-right" : ""}`}>
                          <p className="text-[10px] text-text-muted mb-0.5">{c.full_name} • {new Date(c.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                          <div className={`inline-block px-3 py-1.5 rounded-xl text-xs ${
                            isMe ? "bg-indigo-500 text-white rounded-tr-none" : "bg-surface border border-surface-border text-text-primary rounded-tl-none"
                          }`}>
                            {c.content}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
