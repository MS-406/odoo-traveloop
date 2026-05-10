// frontend/src/pages/LandingPage.tsx
// Pre-auth marketing landing page.
import { Link } from "react-router-dom";
import { Globe, MapPin, Calendar, DollarSign, Shield, ArrowRight, Compass, ListChecks, FileText } from "lucide-react";

const FEATURES = [
  { icon: MapPin, title: "Smart Itineraries", desc: "Plan multi-city trips with drag-and-drop stop reordering" },
  { icon: Globe, title: "Discover Cities", desc: "Browse 20+ destinations with cost index and popularity ratings" },
  { icon: Compass, title: "Curated Activities", desc: "50+ handpicked activities across sightseeing, food, adventure & more" },
  { icon: DollarSign, title: "Budget Tracking", desc: "Real-time budget breakdown by category and city with visual charts" },
  { icon: ListChecks, title: "Packing Lists", desc: "Category-grouped checklists with progress tracking" },
  { icon: FileText, title: "Trip Notes", desc: "Attach notes to trips and individual stops" },
  { icon: Calendar, title: "Calendar View", desc: "See your itinerary in timeline or day-grid calendar format" },
  { icon: Shield, title: "Share & Collaborate", desc: "Make trips public and share via link with anyone" },
];

const STATS = [
  { value: "20+", label: "Destinations" },
  { value: "50+", label: "Activities" },
  { value: "100%", label: "Free" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <span className="text-xl font-bold gradient-text">🌍 Traveloop</span>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">Sign In</Link>
            <Link to="/signup" className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-all">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Globe className="h-4 w-4" /> Your personal travel planner
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold text-text-primary leading-tight">
              Plan Your Dream Trip <br />
              <span className="gradient-text">With Confidence</span>
            </h1>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Build multi-city itineraries, discover activities, track budgets, and share your plans — all in one beautiful app.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link to="/signup" className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark active:scale-[0.98] transition-all shadow-lg shadow-primary/25">
                Start Planning Free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-lg border border-surface-border font-medium text-text-secondary hover:bg-surface transition-all">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-surface-border bg-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-3 gap-8 text-center">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="text-3xl sm:text-4xl font-bold gradient-text">{s.value}</p>
                <p className="text-sm text-text-muted mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-text-primary">Everything You Need</h2>
          <p className="text-text-secondary mt-2">Powerful features to make trip planning effortless</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass-card p-6 hover:shadow-md transition-all group">
              <div className="p-2 rounded-lg bg-primary/10 w-fit group-hover:bg-primary/20 transition-colors">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-text-primary mt-4">{f.title}</h3>
              <p className="text-sm text-text-secondary mt-2">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary to-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to Explore?</h2>
          <p className="text-white/80 mt-2 max-w-xl mx-auto">Join Traveloop and start building your perfect itinerary today.</p>
          <Link to="/signup" className="inline-flex items-center gap-2 mt-6 px-8 py-3 rounded-lg bg-white text-primary font-medium hover:bg-white/90 active:scale-[0.98] transition-all shadow-lg">
            Create Free Account <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-text-primary text-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-lg font-bold text-white">🌍 Traveloop</span>
            <p className="text-sm">© {new Date().getFullYear()} Traveloop. Built with ❤️ for travelers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
