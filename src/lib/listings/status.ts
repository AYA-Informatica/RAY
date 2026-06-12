/** Shared listing-status presentation: badge tone + i18n label per ListingStatus. */
export const STATUS_TONE: Record<string, "success" | "warning" | "danger" | "muted" | "navy"> = {
  ACTIVE: "success", SOLD: "navy", EXPIRED: "muted", REMOVED: "danger", FLAGGED: "warning",
};

export const STATUS_KEY: Record<string, string> = {
  ACTIVE: "myAds.status.active", SOLD: "myAds.status.sold",
  EXPIRED: "myAds.status.expired", REMOVED: "myAds.status.removed", FLAGGED: "myAds.status.flagged",
};
