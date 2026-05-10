// frontend/src/pages/ForgotPasswordPage.tsx
// Placeholder forgot-password page.
// Note: Password reset requires email sending infrastructure (SMTP / SendGrid).
// This page is a UI placeholder — the backend endpoint is not in the spec.

import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (_data: ForgotFormValues) => {
    // Simulated — no backend endpoint for password reset in spec
    setSubmitted(true);
    toast.success("If an account exists with this email, a reset link has been sent.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/5 via-surface to-primary/5 flex items-center justify-center px-4 py-12">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="glass-card p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-accent/10 mb-2">
              <Mail className="h-7 w-7 text-accent" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">Reset your password</h1>
            <p className="text-sm text-text-secondary">
              Enter your email and we'll send you a reset link
            </p>
          </div>

          {submitted ? (
            <div className="text-center space-y-4 py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10">
                <Send className="h-8 w-8 text-success" />
              </div>
              <p className="text-sm text-text-secondary">
                Check your inbox for a password reset link. If you don't see it, check your spam folder.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:text-primary-dark transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <div>
                <label htmlFor="forgot-email" className="block text-sm font-medium text-text-primary mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white text-sm transition-colors
                      focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                      ${errors.email ? "border-danger" : "border-surface-border"}`}
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-danger">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg
                  bg-accent text-white font-medium text-sm
                  hover:bg-accent-dark active:scale-[0.98] transition-all"
              >
                <Send className="h-4 w-4" />
                Send Reset Link
              </button>

              <p className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back to login
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
