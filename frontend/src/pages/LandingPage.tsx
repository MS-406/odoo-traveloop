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
  { icon: Calendar, title: "Calendar View", desc: "See your itinerary in timeline or day-grid format" },
  { icon: Shield, title: "Share & Collaborate", desc: "Make trips public and share via link with anyone" },
];

const STATS = [
  { value: "20+", label: "Destinations" },
  { value: "50+", label: "Activities" },
  { value: "100%", label: "Free" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface font-sans">
      {/* Navbar - Glassmorphism */}
      <nav className="fixed w-full top-0 z-50 bg-white/70 backdrop-blur-md border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-display font-bold text-primary flex items-center gap-2">
            <Globe className="h-6 w-6 text-accent" /> Traveloop
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">Sign In</Link>
            <Link to="/signup" className="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-all shadow-md shadow-primary/20">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-card border border-surface-border text-sm font-medium text-primary mb-8 shadow-ambient">
              <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse"></span>
              Your personal travel concierge
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-bold text-text-primary leading-[1.1] tracking-tight mb-6">
              Plan Your Dream Trip <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">With Absolute Confidence</span>
            </h1>
            
            <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
              Build multi-city itineraries, discover activities, track budgets, and share your plans — beautifully organized in one place.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-lg shadow-primary/30 text-lg">
                Start Planning Free <ArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/login" className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-surface-card border-2 border-surface-border font-medium text-text-primary hover:border-primary/20 hover:bg-primary/5 transition-all text-lg">
                Welcome Back
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-20 -mt-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-surface-card/80 backdrop-blur-xl border border-surface-border rounded-2xl shadow-ambient p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-surface-border">
            {STATS.map((s) => (
              <div key={s.label} className="pt-4 md:pt-0 first:pt-0">
                <p className="text-4xl font-display font-bold text-primary">{s.value}</p>
                <p className="text-sm font-medium text-text-secondary uppercase tracking-wider mt-2">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-4">Everything you need in one suite</h2>
            <p className="text-lg text-text-secondary">Powerful tools designed to make trip planning effortless and enjoyable.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-surface-card rounded-2xl p-8 border border-surface-border shadow-sm hover:shadow-ambient hover:-translate-y-1 transition-all duration-300 group">
                <div className="h-14 w-14 rounded-xl bg-primary/5 flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                  <f.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-display font-bold text-text-primary mb-3">{f.title}</h3>
                <p className="text-text-secondary leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore by Region */}
      <section className="py-24 relative overflow-hidden bg-surface-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-4">Explore by Region</h2>
            <p className="text-lg text-text-secondary">Discover your next adventure across the globe.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { name: "Europe", img: "https://loremflickr.com/600/400/europe,city,architecture/all" },
              { name: "Asia", img: "https://loremflickr.com/600/400/asia,temple,nature/all" },
              { name: "Africa", img: "https://loremflickr.com/600/400/africa,safari,landscape/all" },
              { name: "Middle East", img: "https://loremflickr.com/600/400/middleeast,desert,city/all" },
              { name: "North America", img: "https://loremflickr.com/600/400/northamerica,city,nature/all" },
              { name: "South America", img: "https://loremflickr.com/600/400/southamerica,mountains,city/all" },
              { name: "Oceania", img: "https://loremflickr.com/600/400/oceania,beach,ocean/all" },
              { name: "Antarctica", img: "https://loremflickr.com/600/400/antarctica,ice,penguin/all" },
            ].map((region) => (
              <Link 
                key={region.name}
                to={`/cities?region=${encodeURIComponent(region.name)}`}
                className="group relative h-48 sm:h-64 rounded-2xl overflow-hidden shadow-sm hover:shadow-ambient transition-all duration-500 hover:-translate-y-1"
              >
                <img 
                  src={region.img} 
                  alt={region.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute bottom-0 left-0 p-4 sm:p-6 w-full">
                  <h3 className="text-white font-display font-bold text-lg sm:text-xl transform transition-transform duration-500 group-hover:translate-x-1">
                    {region.name}
                  </h3>
                  <div className="h-0.5 w-0 group-hover:w-12 bg-accent transition-all duration-500 mt-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent opacity-90"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">Ready to Explore the World?</h2>
          <p className="text-xl text-primary-light mb-10">Join Traveloop today and experience the future of travel planning.</p>
          <Link to="/signup" className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl bg-white text-primary font-bold hover:bg-surface-card hover:scale-105 active:scale-95 transition-all shadow-xl text-lg">
            Create Your Free Account <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-text-primary pt-16 pb-8 border-t border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
            <div className="flex items-center gap-2">
              <Globe className="h-8 w-8 text-accent" />
              <span className="text-2xl font-display font-bold text-white">Traveloop</span>
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-text-muted hover:text-white transition-colors">About</a>
              <a href="#" className="text-text-muted hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-text-muted hover:text-white transition-colors">Terms</a>
            </div>
          </div>
          <div className="text-center border-t border-text-secondary/30 pt-8">
            <p className="text-text-muted text-sm">© {new Date().getFullYear()} Traveloop. Designed for travelers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
