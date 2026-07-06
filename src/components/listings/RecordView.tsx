"use client";

import { useEffect } from "react";
import { recordView, type RecentItem } from "@/lib/recentlyViewed";
import { logger } from "@/lib/logger";

/** Drop this once on a listing detail page — records the view in localStorage. */
export function RecordView({ item }: { item: RecentItem }) {
  useEffect(() => {
    logger.debug({ listingId: item.id }, "[RecordView] listing view recorded");
    recordView(item);
  }, [item]);
  return null;
}
