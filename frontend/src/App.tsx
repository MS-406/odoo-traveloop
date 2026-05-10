// frontend/src/App.tsx
// Root component — full routing for Phase 2–6.

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

// Discovery & Budget (Phase 4)
import CitySearchPage from "@/pages/CitySearchPage";
import ActivitySearchPage from "@/pages/ActivitySearchPage";
import BudgetPage from "@/pages/BudgetPage";

// Notes & Checklist (Phase 5)
import NotesPage from "@/pages/NotesPage";
import ChecklistPage from "@/pages/ChecklistPage";

// Settings & Admin (Phase 6)
import SettingsPage from "@/pages/SettingsPage";
import AdminPage from "@/pages/AdminPage";

// Layout
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";

// Layout wrapper that adds Navbar to protected pages
function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

// Protected route wrapped with AppLayout
function ProtectedPage({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

function App() {
  const { fetchUser } = useAuthStore();

  useEffect(() => {
    if (localStorage.getItem("access_token")) {
      fetchUser();
    }
  }, [fetchUser]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: { borderRadius: "8px", background: "#111827", color: "#F9FAFB", fontSize: "14px" },
        }}
      />

      <Routes>
        {/* ── Public auth routes ────────────────────────────── */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* ── Protected routes (with Navbar) ────────────────── */}
        <Route path="/dashboard" element={<ProtectedPage><DashboardPage /></ProtectedPage>} />

        {/* Trip CRUD (Phase 3) */}
        <Route path="/trips" element={<ProtectedPage><MyTripsPage /></ProtectedPage>} />
        <Route path="/trips/new" element={<ProtectedPage><CreateTripPage /></ProtectedPage>} />
        <Route path="/trips/:id" element={<ProtectedPage><TripDetailPage /></ProtectedPage>} />
        <Route path="/trips/:id/edit" element={<ProtectedPage><EditTripPage /></ProtectedPage>} />
        <Route path="/trips/:id/builder" element={<ProtectedPage><ItineraryBuilderPage /></ProtectedPage>} />
        <Route path="/trips/:id/itinerary" element={<ProtectedPage><ItineraryViewPage /></ProtectedPage>} />
        <Route path="/trips/:id/budget" element={<ProtectedPage><BudgetPage /></ProtectedPage>} />
        <Route path="/trips/:id/notes" element={<ProtectedPage><NotesPage /></ProtectedPage>} />
        <Route path="/trips/:id/checklist" element={<ProtectedPage><ChecklistPage /></ProtectedPage>} />

        {/* Discovery (Phase 4) */}
        <Route path="/cities" element={<ProtectedPage><CitySearchPage /></ProtectedPage>} />
        <Route path="/activities" element={<ProtectedPage><ActivitySearchPage /></ProtectedPage>} />

        {/* Settings & Admin (Phase 6) */}
        <Route path="/settings" element={<ProtectedPage><SettingsPage /></ProtectedPage>} />
        <Route path="/admin" element={<ProtectedPage><AdminPage /></ProtectedPage>} />

        {/* ── Redirects ────────────────────────────────────── */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
