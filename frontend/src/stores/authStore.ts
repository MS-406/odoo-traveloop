// frontend/src/stores/authStore.ts
// Zustand store for auth state — user profile, loading, and auth actions.
// Zustand chosen: minimal boilerplate, sufficient for this scope, no providers needed.
// Depends on: Phase 2 / api/auth.ts

import { create } from "zustand";
import { authApi, UserProfile, LoginPayload, SignupPayload } from "@/api/auth";

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  setUser: (user: UserProfile | null) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,

  login: async (payload) => {
    set({ isLoading: true });
    try {
      const { data } = await authApi.login(payload);
      localStorage.setItem("access_token", data.access_token);
      // Fetch full user profile after login
      await get().fetchUser();
    } finally {
      set({ isLoading: false });
    }
  },

  signup: async (payload) => {
    set({ isLoading: true });
    try {
      await authApi.signup(payload);
      // After signup, auto-login
      await get().login({ email: payload.email, password: payload.password });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout API errors — clear local state regardless
    } finally {
      localStorage.removeItem("access_token");
      set({ user: null, isAuthenticated: false });
    }
  },

  fetchUser: async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }
    set({ isLoading: true });
    try {
      const { data } = await authApi.getMe();
      set({ user: data, isAuthenticated: true });
    } catch {
      localStorage.removeItem("access_token");
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  reset: () => {
    localStorage.removeItem("access_token");
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
}));

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
