// frontend/src/App.tsx
// Root component — complete routing for all phases (2–7).

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import React, { useEffect, Suspense } from "react";
import { useAuthStore } from "@/stores/authStore";

// Layout
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";

// Lazy-loaded pages
const LandingPage = React.lazy(() => import("@/pages/LandingPage"));
const LoginPage = React.lazy(() => import("@/pages/LoginPage"));
const SignupPage = React.lazy(() => import("@/pages/SignupPage"));
const ForgotPasswordPage = React.lazy(() => import("@/pages/ForgotPasswordPage"));
const DashboardPage = React.lazy(() => import("@/pages/DashboardPage"));
const MyTripsPage = React.lazy(() => import("@/pages/MyTripsPage"));
const CreateTripPage = React.lazy(() => import("@/pages/CreateTripPage"));
const EditTripPage = React.lazy(() => import("@/pages/EditTripPage"));
const TripDetailPage = React.lazy(() => import("@/pages/TripDetailPage"));
const ItineraryBuilderPage = React.lazy(() => import("@/pages/ItineraryBuilderPage"));
const ItineraryViewPage = React.lazy(() => import("@/pages/ItineraryViewPage"));
const CitySearchPage = React.lazy(() => import("@/pages/CitySearchPage"));
const ActivitySearchPage = React.lazy(() => import("@/pages/ActivitySearchPage"));
const BudgetPage = React.lazy(() => import("@/pages/BudgetPage"));
const NotesPage = React.lazy(() => import("@/pages/NotesPage"));
const ChecklistPage = React.lazy(() => import("@/pages/ChecklistPage"));
const SettingsPage = React.lazy(() => import("@/pages/SettingsPage"));
const AdminPage = React.lazy(() => import("@/pages/AdminPage"));
const PublicTripPage = React.lazy(() => import("@/pages/PublicTripPage"));
const NotFoundPage = React.lazy(() => import("@/pages/NotFoundPage"));
const AiTripOptimizerPage = React.lazy(() => import("@/pages/AiTripOptimizerPage"));
const CollaborativeTripPage = React.lazy(() => import("@/pages/CollaborativeTripPage"));
const CollaborativeTripWorkspace = React.lazy(() => import("@/pages/CollaborativeTripWorkspace"));

function AppLayout({ children }: { children: React.ReactNode }) {
  return (<><Navbar />{children}</>);
}

function ProtectedPage({ children }: { children: React.ReactNode }) {
  return (<ProtectedRoute><AppLayout>{children}</AppLayout></ProtectedRoute>);
}

// Fallback loader for Suspense
function PageLoader() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      <p className="text-gray-400 text-sm font-medium animate-pulse">Loading experience...</p>
    </div>
  );
}

// Root page: landing for guests, dashboard for authenticated users
function RootRedirect() {
  const { user, isLoading } = useAuthStore();
  if (isLoading) return <PageLoader />;
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

      <Suspense fallback={<PageLoader />}>
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
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
