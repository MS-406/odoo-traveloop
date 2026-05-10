// frontend/src/pages/NotFoundPage.tsx
// 404 page with animated globe and navigation options.
import { Link } from "react-router-dom";
import { Home, ArrowLeft, MapPin } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        {/* Animated globe */}
        <div className="relative mx-auto w-32 h-32">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 animate-pulse" />
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
            <span className="text-5xl">🌍</span>
          </div>
        </div>

        <div>
          <h1 className="text-7xl font-bold gradient-text">404</h1>
          <h2 className="text-xl font-semibold text-text-primary mt-2">Page Not Found</h2>
          <p className="text-text-secondary mt-2">Looks like you've wandered off the map. Let's get you back on track!</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-all"
          >
            <Home className="h-4 w-4" /> Go to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg border border-surface-border text-sm font-medium text-text-secondary hover:bg-surface transition-all"
          >
            <ArrowLeft className="h-4 w-4" /> Go Back
          </button>
        </div>

        <div className="pt-4">
          <Link to="/cities" className="text-sm text-primary hover:text-primary-dark transition-colors flex items-center justify-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> Or explore some destinations
          </Link>
        </div>
      </div>
    </div>
  );
}
