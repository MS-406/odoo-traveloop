// frontend/src/pages/NotFoundPage.tsx
// 404 page with animated globe and navigation options.
import { Link } from "react-router-dom";
import { Home, ArrowLeft, MapPin } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background orbs */}
      <div className="absolute top-1/4 left-1/4 w-[30%] h-[30%] bg-primary/10 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[30%] h-[30%] bg-secondary/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="text-center space-y-8 max-w-md relative z-10 glass-card p-10">
        {/* Animated globe */}
        <div className="relative mx-auto w-32 h-32">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 animate-pulse shadow-ambient" />
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center backdrop-blur-sm">
            <span className="text-6xl">🌍</span>
          </div>
        </div>

        <div>
          <h1 className="text-8xl font-display font-bold gradient-text tracking-tighter">404</h1>
          <h2 className="text-2xl font-display font-bold text-text-primary mt-4">Page Not Found</h2>
          <p className="text-text-secondary mt-3 text-lg">Looks like you've wandered off the map. Let's get you back on track!</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-sm hover:shadow-ambient transition-all"
          >
            <Home className="h-5 w-5" /> Go to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-surface-border font-bold text-text-secondary hover:text-text-primary hover:bg-surface shadow-sm hover:shadow-ambient transition-all bg-white"
          >
            <ArrowLeft className="h-5 w-5" /> Go Back
          </button>
        </div>

        <div className="pt-6">
          <Link to="/cities" className="text-sm font-bold text-primary hover:text-primary-dark transition-colors flex items-center justify-center gap-1.5 bg-primary/5 inline-flex px-4 py-2 rounded-full">
            <MapPin className="h-4 w-4" /> Or explore some destinations
          </Link>
        </div>
      </div>
    </div>
  );
}
