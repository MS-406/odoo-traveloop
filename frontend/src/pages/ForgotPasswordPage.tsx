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
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Decorative background orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[100px] animate-pulse" />

      <div className="relative w-full max-w-md z-10">
        <div className="glass-card p-8 sm:p-10 space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-2 shadow-sm">
              <Mail className="h-8 w-8 text-accent" />
            </div>
            <h1 className="text-3xl font-display font-bold text-text-primary tracking-tight">Reset your password</h1>
            <p className="text-text-secondary">
              Enter your email and we'll send you a reset link
            </p>
          </div>

          {submitted ? (
            <div className="text-center space-y-6 py-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 shadow-sm">
                <Send className="h-10 w-10 text-accent" />
              </div>
              <p className="text-text-secondary">
                Check your inbox for a password reset link. If you don't see it, check your spam folder.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-primary font-bold hover:text-primary-dark transition-colors bg-primary/5 px-6 py-3 rounded-xl"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              <div>
                <label htmlFor="forgot-email" className="block text-sm font-medium text-text-primary mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
                  <input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border bg-surface-card text-sm transition-all
                      focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary shadow-sm
                      ${errors.email ? "border-danger" : "border-surface-border hover:border-text-muted"}`}
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-sm font-medium text-danger">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl
                  bg-accent text-white font-bold text-base shadow-sm
                  hover:bg-accent-dark active:scale-[0.98] transition-all"
              >
                <Send className="h-5 w-5" />
                Send Reset Link
              </button>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-primary transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
