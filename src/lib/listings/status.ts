/** Shared listing-status presentation: badge tone + i18n label per ListingStatus.
 *  Keyed by string (not the Prisma enum) so callers don't need to cast — the
 *  set of values is exhaustive for all ListingStatus variants. */
export const STATUS_TONE: Record<string, "success" | "warning" | "danger" | "muted" | "navy"> = {
  ACTIVE: "success", SOLD: "navy", EXPIRED: "muted", REMOVED: "danger", FLAGGED: "warning",
};

export const STATUS_KEY: Record<string, string> = {
  ACTIVE: "myAds.status.active", SOLD: "myAds.status.sold",
  EXPIRED: "myAds.status.expired", REMOVED: "myAds.status.removed", FLAGGED: "myAds.status.flagged",
};

/** Tailwind classes for the non-ACTIVE status banner on the listing detail page. */
export const STATUS_BANNER_CLASS: Record<string, string> = {
  SOLD: "border-navy/40 bg-navy/15 text-text-primary",
  EXPIRED: "border-border bg-surface-modal text-text-secondary",
  REMOVED: "border-danger/40 bg-danger/15 text-danger",
  FLAGGED: "border-warning/40 bg-warning/15 text-warning",
};
