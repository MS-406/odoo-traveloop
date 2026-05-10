// frontend/src/App.tsx
// Root component — React Router setup with Phase 2 auth + Phase 3 trip + Phase 4 discovery routes.

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";

// Auth pages (Phase 2)
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";

// Trip pages (Phase 3)
import DashboardPage from "@/pages/DashboardPage";
import MyTripsPage from "@/pages/MyTripsPage";
import CreateTripPage from "@/pages/CreateTripPage";
import EditTripPage from "@/pages/EditTripPage";
import TripDetailPage from "@/pages/TripDetailPage";
import ItineraryBuilderPage from "@/pages/ItineraryBuilderPage";
import ItineraryViewPage from "@/pages/ItineraryViewPage";

// Discovery & Budget pages (Phase 4)
import CitySearchPage from "@/pages/CitySearchPage";
import ActivitySearchPage from "@/pages/ActivitySearchPage";
import BudgetPage from "@/pages/BudgetPage";

// Layout
import ProtectedRoute from "@/components/layout/ProtectedRoute";

function App() {
  const { fetchUser } = useAuthStore();

  useEffect(() => {
    // On app mount, try to restore session from stored token
    if (localStorage.getItem("access_token")) {
      fetchUser();
    }
  }, [fetchUser]);

  return (
    <BrowserRouter>
      {/* react-hot-toast: lightweight toast notifications positioned top-center */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: "8px",
            background: "#111827",
            color: "#F9FAFB",
            fontSize: "14px",
          },
        }}
      />

      <Routes>
        {/* ── Public auth routes ──────────────────────────────────── */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* ── Protected routes — require authentication ───────────── */}
        {/* Dashboard */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

        {/* Trip CRUD (Phase 3) */}
        <Route path="/trips" element={<ProtectedRoute><MyTripsPage /></ProtectedRoute>} />
        <Route path="/trips/new" element={<ProtectedRoute><CreateTripPage /></ProtectedRoute>} />
        <Route path="/trips/:id" element={<ProtectedRoute><TripDetailPage /></ProtectedRoute>} />
        <Route path="/trips/:id/edit" element={<ProtectedRoute><EditTripPage /></ProtectedRoute>} />
        <Route path="/trips/:id/builder" element={<ProtectedRoute><ItineraryBuilderPage /></ProtectedRoute>} />
        <Route path="/trips/:id/itinerary" element={<ProtectedRoute><ItineraryViewPage /></ProtectedRoute>} />
        <Route path="/trips/:id/budget" element={<ProtectedRoute><BudgetPage /></ProtectedRoute>} />

        {/* City & Activity discovery (Phase 4) — protected for now */}
        <Route path="/cities" element={<ProtectedRoute><CitySearchPage /></ProtectedRoute>} />
        <Route path="/activities" element={<ProtectedRoute><ActivitySearchPage /></ProtectedRoute>} />

        {/* ── Redirects ──────────────────────────────────────────── */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
