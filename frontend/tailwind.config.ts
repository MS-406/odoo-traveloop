// frontend/tailwind.config.ts
// Design system tokens — defined once, used everywhere.
// Uses the exact color palette from the spec.

import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563EB",
          light: "#93C5FD",
          dark: "#1D4ED8",
        },
        secondary: {
          DEFAULT: "#7C3AED",
          light: "#C4B5FD",
          dark: "#6D28D9",
        },
        accent: {
          DEFAULT: "#F59E0B",
          light: "#FDE68A",
          dark: "#D97706",
        },
        danger: {
          DEFAULT: "#EF4444",
          light: "#FECACA",
          dark: "#B91C1C",
        },
        success: {
          DEFAULT: "#10B981",
          light: "#A7F3D0",
          dark: "#059669",
        },
        surface: {
          DEFAULT: "#F9FAFB",
          card: "#FFFFFF",
          border: "#E5E7EB",
        },
        text: {
          primary: "#111827",
          secondary: "#6B7280",
          muted: "#9CA3AF",
        },
      },
      fontFamily: {
        // Inter for clean, modern typography
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "8px",  // Cards
        xl: "12px", // Modals
      },
      spacing: {
        // 8px base grid enforced via Tailwind defaults (p-2=8px, p-4=16px, etc.)
      },
    },
  },
  plugins: [],
};

export default config;
