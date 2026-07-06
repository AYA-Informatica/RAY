"use client";

import { create } from "zustand";
import { logger } from "@/lib/logger";

/**
 * Client-side favorite state. Optimistic — syncs to /api/favorites.
 * Hydrated from the server on first load via setInitial().
 */
interface FavoritesState {
  ids: Set<string>;
  /** True once setInitial() has hydrated from the server. */
  ready: boolean;
  setInitial: (ids: string[]) => void;
  toggle: (listingId: string) => Promise<void>;
  has: (listingId: string) => boolean;
}

export const useFavorites = create<FavoritesState>((set, get) => ({
  ids: new Set(),
  ready: false,
  setInitial: (ids) => {
    logger.debug({ count: ids.length }, "[useFavorites] setInitial called");
    set({ ids: new Set(ids), ready: true });
  },
  has: (id) => get().ids.has(id),
  toggle: async (listingId) => {
    const had = get().ids.has(listingId);
    logger.debug({ listingId, had }, "[useFavorites] toggle called");
    set((s) => {
      const next = new Set(s.ids);
      if (had) next.delete(listingId); else next.add(listingId);
      return { ids: next };
    });
    try {
      const res = await fetch(`/api/favorites/${listingId}`, { method: had ? "DELETE" : "POST" });
      if (res.status === 401) {
        // Not signed in — revert and redirect to login.
        logger.debug({ listingId }, "[useFavorites] toggle unauthorized, reverting");
        set((s) => {
          const next = new Set(s.ids);
          if (had) next.add(listingId); else next.delete(listingId);
          return { ids: next };
        });
        window.location.href = `/login?redirect=/listing/${listingId}`;
        return;
      }
    } catch {
      logger.debug({ listingId }, "[useFavorites] toggle network error, reverting");
      set((s) => {
        const next = new Set(s.ids);
        if (had) next.add(listingId); else next.delete(listingId);
        return { ids: next };
      });
    }
  },
}));
