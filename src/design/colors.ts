/**
 * RAY colour tokens — NON-NEGOTIABLE.
 * Mirrors tailwind.config.ts. Never introduce colours outside this set.
 */
export const colors = {
  primary: "#E8390E",
  primaryDark: "#C42E08",

  background: "#111111",
  surfaceCard: "#242424",
  surfaceModal: "#2C2C2C",

  navy: "#1B2B5E",

  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",

  textPrimary: "#FFFFFF",
  textSecondary: "#A0A0A0",
  textMuted: "#8A8A8A",

  border: "#2E2E2E",
} as const;

export type ColorToken = keyof typeof colors;
