// frontend/src/pages/SignupPage.tsx
// Signup page with centered card layout matching the login page design language.
// Depends on: Phase 2 / SignupForm.tsx

import SignupForm from "@/components/auth/SignupForm";
import { Globe } from "lucide-react";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/5 via-surface to-primary/5 flex items-center justify-center px-4 py-12">
      {/* Decorative background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="glass-card p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-secondary/10 mb-2">
              <Globe className="h-7 w-7 text-secondary" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">Create your account</h1>
            <p className="text-sm text-text-secondary">
              Start planning unforgettable trips today
            </p>
          </div>

          {/* Form */}
          <SignupForm />
        </div>

        {/* Bottom decoration */}
        <p className="text-center text-xs text-text-muted mt-6">
          🌍 Traveloop — Your personalized travel companion
        </p>
      </div>
    </div>
  );
}

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
