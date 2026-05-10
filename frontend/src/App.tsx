// frontend/src/App.tsx
// Root component — React Router setup will be expanded in Phase 2+.
// For Phase 1, renders a simple landing to verify the build pipeline works.

import { BrowserRouter, Routes, Route } from "react-router-dom";

function HomePage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center space-y-6 p-8">
        {/* Animated gradient logo */}
        <h1 className="text-5xl font-extrabold gradient-text animate-pulse">
          🌍 Traveloop
        </h1>
        <p className="text-text-secondary text-lg max-w-md mx-auto">
          Your personalized travel planning companion. Build itineraries,
          discover cities, and track your budget — all in one place.
        </p>
        <div className="flex gap-4 justify-center">
          <div className="glass-card px-6 py-3 text-sm font-medium text-primary">
            ✅ Frontend Ready
          </div>
          <div className="glass-card px-6 py-3 text-sm font-medium text-success">
            ✅ Tailwind Active
          </div>
        </div>
        <p className="text-text-muted text-xs mt-8">
          Phase 1 scaffold complete — auth screens coming in Phase 2
        </p>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* Phase 2+: auth, dashboard, trips, etc. */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
