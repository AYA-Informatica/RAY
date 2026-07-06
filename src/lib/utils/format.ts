import { logger } from "@/lib/logger";

/** Format a price in Rwandan Francs, e.g. "Rwf 3,000,000". */
export function formatPrice(amount: number): string {
  try {
    return `Rwf ${new Intl.NumberFormat("en-RW").format(Math.round(amount))}`;
  } catch {
    // Fallback for environments where en-RW locale data is unavailable
    logger.debug("[format] formatPrice en-RW locale unavailable — using toLocaleString fallback");
    return `Rwf ${Math.round(amount).toLocaleString()}`;
  }
}

/**
 * Realtime payloads (Broadcast and postgres_changes) serialize `timestamp
 * without time zone` columns without a `Z`/offset (e.g.
 * "2026-06-13T11:51:35.913"). `new Date(...)` on a string with no timezone
 * designator is parsed as browser-local time, not UTC — shifting the value
 * by the browser's UTC offset. REST/Prisma responses are unaffected (Prisma
 * serializes `Date` with a trailing `Z`). Append `Z` so realtime timestamps
 * are parsed as UTC too.
 */
export function toUtcIso(ts: string): string {
  return /[Zz]|[+-]\d\d:\d\d$/.test(ts) ? ts : `${ts}Z`;
}

/** Relative time, e.g. "2 hours ago", "3 days ago". Locale-aware via Intl. */
export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);

  // Use Intl.RelativeTimeFormat for non-English locales (rw, fr).
  // Detects the active locale from <html lang="…">; falls back to English.
  if (typeof Intl !== "undefined" && Intl.RelativeTimeFormat) {
    const locale =
      (typeof document !== "undefined" && document.documentElement.lang) || "en";
    if (locale !== "en") {
      try {
        const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
        if (seconds < 60) return rtf.format(0, "second");
        const mins = Math.floor(seconds / 60);
        const hrs = Math.floor(seconds / 3600);
        const days = Math.floor(seconds / 86400);
        const weeks = Math.floor(seconds / 604800);
        const months = Math.floor(seconds / 2592000);
        const years = Math.floor(seconds / 31536000);
        if (years >= 1) return rtf.format(-years, "year");
        if (months >= 1) return rtf.format(-months, "month");
        if (weeks >= 1) return rtf.format(-weeks, "week");
        if (days >= 1) return rtf.format(-days, "day");
        if (hrs >= 1) return rtf.format(-hrs, "hour");
        return rtf.format(-mins, "minute");
      } catch {
        // Locale not supported by this browser's Intl data — fall through
      }
    }
  }

  // English fallback
  if (seconds < 60) return "just now";
  const units: [number, string][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.345, "week"],
    [12, "month"],
    [Number.POSITIVE_INFINITY, "year"],
  ];
  let value = seconds;
  let unit = "second";
  for (const [factor, name] of units) {
    if (Math.abs(value) < factor) { unit = name; break; }
    value = Math.floor(value / factor);
    unit = name;
  }
  const rounded = Math.max(1, value);
  return `${rounded} ${unit}${rounded > 1 ? "s" : ""} ago`;
}

/** Haversine distance in km between two lat/lng points. */
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 10) / 10;
}

/** Format a distance label, e.g. "450 m away", "3 km away". */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m away`;
  return `${km} km away`;
}

/** Round a result count down to the nearest 10 with a "+", e.g. 33 -> "30+". Counts under 10 are shown exactly. */
export function formatResultCount(total: number): string {
  if (total < 10) return `${total}`;
  return `${Math.floor(total / 10) * 10}+`;
}

const CONDITION_LABELS: Record<string, string> = {
  NEW: "New",
  LIKE_NEW: "Like new",
  GOOD: "Good",
  FAIR: "Fair",
  USED: "Used",
};
export function conditionLabel(c: string): string {
  return CONDITION_LABELS[c] ?? c;
}

/** Online if seen within the last 2 minutes. */
export function isOnline(lastSeenAt: Date | string): boolean {
  const d = typeof lastSeenAt === "string" ? new Date(lastSeenAt) : lastSeenAt;
  return Date.now() - d.getTime() < 2 * 60 * 1000;
}

/** Presence label: "Online" or "Last seen 5 minutes ago". */
export function presenceLabel(lastSeenAt: Date | string): string {
  return isOnline(lastSeenAt) ? "Online" : `Last seen ${timeAgo(lastSeenAt)}`;
}
