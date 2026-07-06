"use client";

import { useEffect, useState } from "react";
import { logger } from "@/lib/logger";

const KEY = "ray_recently_viewed";
const MAX = 8;

export interface RecentItem {
  id: string;
  title: string;
  price: number;
  coverImage: string | null;
  city: string;
}

/** Record a listing view in localStorage. Call once on listing detail mount. */
export function recordView(item: RecentItem) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    const current: RecentItem[] = raw ? (JSON.parse(raw) as RecentItem[]) : [];
    const deduped = current.filter((r) => r.id !== item.id);
    const updated = [item, ...deduped].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(updated));
    logger.debug({ id: item.id, count: updated.length }, "[recentlyViewed] recordView stored");
  } catch {
    logger.debug({ id: item.id }, "[recentlyViewed] recordView storage blocked");
  }
}

/** Returns the recently viewed list (browser only, avoids SSR mismatch). */
export function useRecentlyViewed(): RecentItem[] {
  const [items, setItems] = useState<RecentItem[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      const parsed: RecentItem[] = raw ? (JSON.parse(raw) as RecentItem[]) : [];
      setItems(parsed);
      logger.debug({ count: parsed.length }, "[recentlyViewed] useRecentlyViewed loaded");
    } catch {
      logger.debug("[recentlyViewed] useRecentlyViewed storage blocked");
    }
  }, []);
  return items;
}
