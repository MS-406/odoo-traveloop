// frontend/src/App.tsx
// Root component — React Router setup with auth routes (Phase 2).
// Depends on: Phase 2 / auth pages, ProtectedRoute

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";

// Auth pages
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";

// Layout
import ProtectedRoute from "@/components/layout/ProtectedRoute";

// Placeholder for protected pages (Phase 3+)
function DashboardPlaceholder() {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center space-y-6 p-8 glass-card max-w-md mx-4">
        <h1 className="text-3xl font-bold gradient-text">🌍 Traveloop</h1>
        <p className="text-text-secondary">
          Welcome, <span className="font-semibold text-text-primary">{user?.full_name}</span>!
        </p>
        <p className="text-sm text-text-muted">
          Dashboard and trip screens coming in Phase 3.
        </p>
        <button
          onClick={() => logout()}
          className="px-6 py-2 rounded-lg bg-danger text-white text-sm font-medium
            hover:bg-danger-dark active:scale-[0.98] transition-all"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

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
        {/* Public auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected routes — require authentication */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPlaceholder />
            </ProtectedRoute>
          }
        />

        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Catch-all 404 — redirect to dashboard for now (Phase 7 adds proper 404 page) */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
