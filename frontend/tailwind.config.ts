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
          DEFAULT: "#1E3A8A",
          light: "#3B82F6",
          dark: "#1E40AF",
        },
        secondary: {
          DEFAULT: "#FF6B6B",
          light: "#FF8787",
          dark: "#E03131",
        },
        accent: {
          DEFAULT: "#10B981",
          light: "#34D399",
          dark: "#059669",
        },
        surface: {
          DEFAULT: "#F8FAFC",
          card: "#FFFFFF",
          border: "#E2E8F0",
        },
        text: {
          primary: "#0F172A",
          secondary: "#475569",
          muted: "#94A3B8",
        },
      },
      fontFamily: {
        // Inter for body, Outfit for headings
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Outfit", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "12px",  // Cards
        xl: "16px", // Modals
      },
      boxShadow: {
        ambient: "0 4px 20px 0 rgba(30, 58, 138, 0.08)",
      }
    },
  },
  plugins: [],
};

export default config;
