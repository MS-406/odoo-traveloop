// frontend/src/components/layout/ProtectedRoute.tsx
// Wraps routes that require authentication.
// Redirects to /login?redirect=[current_path] if not authenticated.
// Depends on: Phase 2 / authStore.ts

import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, fetchUser, user } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    // On mount, try to fetch user if we have a token but no user loaded
    if (!user && localStorage.getItem("access_token")) {
      fetchUser();
    }
  }, [user, fetchUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated && !localStorage.getItem("access_token")) {
    // Encode current path so we can redirect back after login
    const redirectPath = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirectPath}`} replace />;
  }

  return <>{children}</>;
}

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
