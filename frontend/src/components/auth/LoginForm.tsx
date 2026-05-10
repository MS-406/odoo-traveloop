// frontend/src/components/auth/LoginForm.tsx
// Login form with react-hook-form + zod validation.
// Depends on: Phase 2 / authStore.ts

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/stores/authStore";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, LogIn } from "lucide-react";
import toast from "react-hot-toast";

// Zod schema — matches backend Pydantic validation rules
const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(255, "Email must be under 255 characters"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data);
      toast.success("Welcome back!");
      // Redirect to original page or dashboard
      const redirect = searchParams.get("redirect") || "/dashboard";
      navigate(decodeURIComponent(redirect), { replace: true });
    } catch (err: any) {
      const message =
        err?.response?.data?.detail || "Login failed. Please try again.";
      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* Email Field */}
      <div>
        <label htmlFor="login-email" className="block text-sm font-medium text-text-primary mb-1.5">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            id="login-email"
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

      {/* Password Field */}
      <div>
        <label htmlFor="login-password" className="block text-sm font-medium text-text-primary mb-1.5">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            className={`w-full pl-10 pr-10 py-2.5 rounded-lg border bg-white text-sm transition-colors
              focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
              ${errors.password ? "border-danger" : "border-surface-border"}`}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-xs text-danger">{errors.password.message}</p>
        )}
      </div>

      {/* Forgot Password Link */}
      <div className="flex justify-end">
        <Link
          to="/forgot-password"
          className="text-xs text-primary hover:text-primary-dark transition-colors"
        >
          Forgot password?
        </Link>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg
          bg-primary text-white font-medium text-sm
          hover:bg-primary-dark active:scale-[0.98] transition-all
          disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
        ) : (
          <>
            <LogIn className="h-4 w-4" />
            Sign In
          </>
        )}
      </button>

      {/* Signup Link */}
      <p className="text-center text-sm text-text-secondary">
        Don't have an account?{" "}
        <Link to="/signup" className="text-primary font-medium hover:text-primary-dark transition-colors">
          Sign up
        </Link>
      </p>
    </form>
  );
}

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
