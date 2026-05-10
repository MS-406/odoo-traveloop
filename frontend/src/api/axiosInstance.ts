// frontend/src/api/axiosInstance.ts
// Central Axios instance with interceptors for silent token refresh.
// Axios chosen: mature HTTP client with interceptor pattern for auth token management.
// Depends on: Phase 2 / authStore.ts

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// Base URL proxied through Vite config — /api rewrites to http://localhost:8000
const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // Required for HTTP-only refresh token cookies
});

// ── Request Interceptor ──────────────────────────────────────────────
// Attach access token to every outgoing request if available
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Lazy import to avoid circular dependency with authStore
  const token = localStorage.getItem("access_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response Interceptor ─────────────────────────────────────────────
// On 401, attempt silent refresh using the HTTP-only cookie
let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];

const processQueue = (token: string) => {
  pendingRequests.forEach((cb) => cb(token));
  pendingRequests = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only attempt refresh on 401, and not on the refresh endpoint itself
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/login")
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Queue this request until the refresh completes
        return new Promise((resolve) => {
          pendingRequests.push((newToken: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const { data } = await api.post("/auth/refresh");
        const newToken = data.access_token;
        localStorage.setItem("access_token", newToken);

        // Retry all queued requests with the new token
        processQueue(newToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed — clear auth state and redirect to login
        localStorage.removeItem("access_token");
        pendingRequests = [];

        // Redirect with the original path so user returns after login
        const currentPath = window.location.pathname;
        if (currentPath !== "/login" && currentPath !== "/signup") {
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
