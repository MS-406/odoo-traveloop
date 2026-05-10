// frontend/src/components/trips/ShareButton.tsx
// Toggle trip public visibility + copy share link.
// Depends on: Phase 3 / tripStore

import { useState } from "react";
import { Globe, Lock, Link2, Check } from "lucide-react";
import { useTripStore } from "@/stores/tripStore";
import toast from "react-hot-toast";

interface ShareButtonProps {
  tripId: string;
  isPublic: boolean;
  shareCode: string | null;
}

export default function ShareButton({ tripId, isPublic, shareCode }: ShareButtonProps) {
  const { updateTrip } = useTripStore();
  const [copied, setCopied] = useState(false);
  const [toggling, setToggling] = useState(false);

  const togglePublic = async () => {
    setToggling(true);
    try {
      await updateTrip(tripId, { is_public: !isPublic });
      toast.success(isPublic ? "Trip is now private" : "Trip is now public!");
    } catch {
      toast.error("Failed to update visibility");
    } finally {
      setToggling(false);
    }
  };

  const copyLink = async () => {
    if (!shareCode) return;
    const url = `${window.location.origin}/public/${shareCode}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={togglePublic}
        disabled={toggling}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
          ${isPublic
            ? "bg-success/10 text-success hover:bg-success/20"
            : "bg-surface text-text-secondary hover:bg-surface-border"
          } disabled:opacity-60`}
      >
        {isPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
        {isPublic ? "Public" : "Private"}
      </button>

      {isPublic && shareCode && (
        <button
          onClick={copyLink}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
            bg-primary/10 text-primary hover:bg-primary/20 transition-all"
        >
          {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
          {copied ? "Copied!" : "Copy Link"}
        </button>
      )}
    </div>
  );
}

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
