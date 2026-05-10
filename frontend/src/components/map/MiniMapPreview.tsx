// frontend/src/components/map/MiniMapPreview.tsx
// Compact non-interactive map preview for TripDetailPage.

import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

const TripRouteMap = lazy(() => import("./TripRouteMap"));

interface Props {
  tripId: string;
}

export default function MiniMapPreview({ tripId }: Props) {
  return (
    <Suspense
      fallback={
        <div className="glass-card h-[200px] flex items-center justify-center">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </div>
      }
    >
      <TripRouteMap tripId={tripId} compact />
    </Suspense>
  );
}
