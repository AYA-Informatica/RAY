/**
 * Font system:
 *   Syne    — display / headings (600–800): hero text, prices, category titles, banners
 *   DM Sans — body (300–700): listings, chat, descriptions, filters
 * Loaded via next/font in src/app/layout.tsx as CSS variables.
 */
export const typography = {
  display: "var(--font-syne)",
  body: "var(--font-dm-sans)",
  weights: {
    displayMin: 600,
    displayMax: 800,
    bodyMin: 300,
    bodyMax: 700,
  },
  scale: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.5rem",
  },
} as const;
