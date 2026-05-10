// frontend/src/App.tsx
// Root component — complete routing for all phases (2–7).

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";

// Landing (Phase 7)
import LandingPage from "@/pages/LandingPage";

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

// Public & 404 (Phase 7)
import PublicTripPage from "@/pages/PublicTripPage";
import NotFoundPage from "@/pages/NotFoundPage";

// New Features
import AiTripOptimizerPage from "@/pages/AiTripOptimizerPage";
import CollaborativeTripPage from "@/pages/CollaborativeTripPage";
import CollaborativeTripWorkspace from "@/pages/CollaborativeTripWorkspace";

// Layout
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";

function AppLayout({ children }: { children: React.ReactNode }) {
  return (<><Navbar />{children}</>);
}

function ProtectedPage({ children }: { children: React.ReactNode }) {
  return (<ProtectedRoute><AppLayout>{children}</AppLayout></ProtectedRoute>);
}

// Root page: landing for guests, dashboard for authenticated users
function RootRedirect() {
  const { user, isLoading } = useAuthStore();
  if (isLoading) return <div className="min-h-screen bg-surface flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" /></div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return <LandingPage />;
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
      <Toaster position="top-center" toastOptions={{ duration: 4000, style: { borderRadius: "8px", background: "#111827", color: "#F9FAFB", fontSize: "14px" } }} />

      <Routes>
        {/* ── Public routes ─────────────────────────────────── */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/public/:shareCode" element={<PublicTripPage />} />

        {/* ── Protected routes (with Navbar) ────────────────── */}
        <Route path="/dashboard" element={<ProtectedPage><DashboardPage /></ProtectedPage>} />
        <Route path="/trips" element={<ProtectedPage><MyTripsPage /></ProtectedPage>} />
        <Route path="/trips/new" element={<ProtectedPage><CreateTripPage /></ProtectedPage>} />
        <Route path="/trips/:id" element={<ProtectedPage><TripDetailPage /></ProtectedPage>} />
        <Route path="/trips/:id/edit" element={<ProtectedPage><EditTripPage /></ProtectedPage>} />
        <Route path="/trips/:id/builder" element={<ProtectedPage><ItineraryBuilderPage /></ProtectedPage>} />
        <Route path="/trips/:id/itinerary" element={<ProtectedPage><ItineraryViewPage /></ProtectedPage>} />
        <Route path="/trips/:id/budget" element={<ProtectedPage><BudgetPage /></ProtectedPage>} />
        <Route path="/trips/:id/notes" element={<ProtectedPage><NotesPage /></ProtectedPage>} />
        <Route path="/trips/:id/checklist" element={<ProtectedPage><ChecklistPage /></ProtectedPage>} />
        <Route path="/cities" element={<ProtectedPage><CitySearchPage /></ProtectedPage>} />
        <Route path="/activities" element={<ProtectedPage><ActivitySearchPage /></ProtectedPage>} />
        <Route path="/settings" element={<ProtectedPage><SettingsPage /></ProtectedPage>} />
        <Route path="/admin" element={<ProtectedPage><AdminPage /></ProtectedPage>} />

        {/* ── New Features ────────────────────────────────────── */}
        <Route path="/ai-trip-optimizer" element={<ProtectedPage><AiTripOptimizerPage /></ProtectedPage>} />
        <Route path="/collaborative-trip" element={<ProtectedPage><CollaborativeTripPage /></ProtectedPage>} />
        <Route path="/collaborative-trip/:id" element={<ProtectedPage><CollaborativeTripWorkspace /></ProtectedPage>} />

        {/* ── 404 catch-all ─────────────────────────────────── */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
