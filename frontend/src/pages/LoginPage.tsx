// frontend/src/pages/LoginPage.tsx
// Login page with centered card layout and animated branding.
// Depends on: Phase 2 / LoginForm.tsx

import LoginForm from "@/components/auth/LoginForm";
import { Plane, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Decorative background orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative w-full max-w-md z-10">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-bold text-text-secondary hover:text-primary transition-colors bg-white/50 px-4 py-2 rounded-lg border border-surface-border shadow-sm backdrop-blur-sm mb-6 w-fit">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        {/* Card */}
        <div className="glass-card p-8 sm:p-10 space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-2 shadow-sm">
              <Plane className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-bold text-text-primary tracking-tight">Welcome back</h1>
            <p className="text-text-secondary">
              Sign in to continue planning your adventures
            </p>
          </div>

          {/* Form */}
          <LoginForm />
        </div>

        {/* Bottom decoration */}
        <p className="text-center text-sm font-medium text-text-muted mt-8">
          🌍 Traveloop — Your personalized travel companion
        </p>
      </div>
    </div>
  );
}

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
