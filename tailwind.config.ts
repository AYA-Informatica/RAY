import type { Config } from "tailwindcss";

/**
 * RAY Tailwind configuration.
 *
 * The colour palette is NON-NEGOTIABLE and mirrors `src/design/colors.ts`.
 * Do NOT introduce additional colours — every component must consume these
 * tokens and nothing outside them.
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#E8390E",
          dark: "#C42E08",
        },
        background: "#111111",
        surface: {
          card: "#242424",
          modal: "#2C2C2C",
        },
        navy: "#1B2B5E",
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        text: {
          primary: "#FFFFFF",
          secondary: "#A0A0A0",
          muted: "#8A8A8A",
        },
        border: "#2E2E2E",
      },
      fontFamily: {
        // Wired up via next/font in src/app/layout.tsx -> CSS variables.
        display: ["var(--font-syne)", "system-ui", "sans-serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        pill: "9999px",
      },
      spacing: {
        // 4px base scale used across the app.
        "1.5": "6px",
        "4.5": "18px",
        "18": "72px",
      },
      boxShadow: {
        card: "0 4px 16px rgba(0, 0, 0, 0.35)",
        modal: "0 12px 48px rgba(0, 0, 0, 0.55)",
        cta: "0 6px 20px rgba(232, 57, 14, 0.35)",
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(100%)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.4s infinite",
        "fade-in-up": "fade-in-up 0.35s ease-out both",
        "fade-in": "fade-in 0.25s ease-out both",
        "scale-in": "scale-in 0.2s ease-out both",
        "slide-up": "slide-up 0.3s cubic-bezier(0.32,0.72,0,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
