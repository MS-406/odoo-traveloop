// frontend/src/components/auth/SignupForm.tsx
// Signup form with react-hook-form + zod validation.
// Validation rules match backend Pydantic validators exactly.
// Depends on: Phase 2 / authStore.ts

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/stores/authStore";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

// Zod schema — matches backend password_strength validator
const signupSchema = z.object({
  full_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be under 100 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(255, "Email must be under 255 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be under 128 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/\d/, "Must contain at least one number")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Must contain at least one special character"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupForm() {
  const { signup, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { full_name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: SignupFormValues) => {
    try {
      await signup({
        full_name: data.full_name,
        email: data.email,
        password: data.password,
      });
      toast.success("Account created! Welcome to Traveloop 🌍");
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      const message =
        err?.response?.data?.detail || "Signup failed. Please try again.";
      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* Full Name */}
      <div>
        <label htmlFor="signup-name" className="block text-sm font-medium text-text-primary mb-1.5">
          Full Name
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            id="signup-name"
            type="text"
            autoComplete="name"
            placeholder="John Doe"
            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white text-sm transition-colors
              focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
              ${errors.full_name ? "border-danger" : "border-surface-border"}`}
            {...register("full_name")}
          />
        </div>
        {errors.full_name && (
          <p className="mt-1 text-xs text-danger">{errors.full_name.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="signup-email" className="block text-sm font-medium text-text-primary mb-1.5">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            id="signup-email"
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

      {/* Password */}
      <div>
        <label htmlFor="signup-password" className="block text-sm font-medium text-text-primary mb-1.5">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Min 8 chars, 1 upper, 1 number, 1 special"
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

      {/* Confirm Password */}
      <div>
        <label htmlFor="signup-confirm" className="block text-sm font-medium text-text-primary mb-1.5">
          Confirm Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            id="signup-confirm"
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Re-enter your password"
            className={`w-full pl-10 pr-10 py-2.5 rounded-lg border bg-white text-sm transition-colors
              focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
              ${errors.confirmPassword ? "border-danger" : "border-surface-border"}`}
            {...register("confirmPassword")}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
            tabIndex={-1}
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-danger">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Submit */}
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
            <UserPlus className="h-4 w-4" />
            Create Account
          </>
        )}
      </button>

      {/* Login Link */}
      <p className="text-center text-sm text-text-secondary">
        Already have an account?{" "}
        <Link to="/login" className="text-primary font-medium hover:text-primary-dark transition-colors">
          Sign in
        </Link>
      </p>
    </form>
  );
}

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
