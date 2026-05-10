// frontend/src/utils/leafletIconFix.ts
// Fix Leaflet's default marker icon paths broken by Vite bundler.
// See: https://github.com/Leaflet/Leaflet/issues/4968

import L from "leaflet";

// @ts-ignore — Vite handles these as asset URLs
import iconUrl from "leaflet/dist/images/marker-icon.png";
// @ts-ignore
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
// @ts-ignore
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });
