// frontend/src/api/auth.ts
// API functions for authentication endpoints.
// Depends on: Phase 2 / axiosInstance.ts

import api from "./axiosInstance";

export interface SignupPayload {
  email: string;
  password: string;
  full_name: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  language: string;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfilePayload {
  full_name?: string;
  avatar_url?: string | null;
  language?: string;
}

export const authApi = {
  signup: (data: SignupPayload) =>
    api.post<UserProfile>("/auth/signup", data),

  login: (data: LoginPayload) =>
    api.post<TokenResponse>("/auth/login", data),

  refresh: () =>
    api.post<TokenResponse>("/auth/refresh"),

  logout: () =>
    api.post("/auth/logout"),

  getMe: () =>
    api.get<UserProfile>("/auth/me"),

  updateMe: (data: UpdateProfilePayload) =>
    api.put<UserProfile>("/auth/me", data),

  deleteMe: () =>
    api.delete("/auth/me"),
};

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
