"use client";

import { useEffect } from "react";
import { recordView, type RecentItem } from "@/lib/recentlyViewed";

/** Drop this once on a listing detail page — records the view in localStorage. */
export function RecordView({ item }: { item: RecentItem }) {
  useEffect(() => { recordView(item); }, [item]);
  return null;
}
