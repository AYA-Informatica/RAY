"use client";

import { create } from "zustand";

/**
 * Client-side favorite state. Optimistic — syncs to /api/favorites.
 * Hydrated from the server on first load via setInitial().
 */
interface FavoritesState {
  ids: Set<string>;
  setInitial: (ids: string[]) => void;
  toggle: (listingId: string) => Promise<void>;
  has: (listingId: string) => boolean;
}

export const useFavorites = create<FavoritesState>((set, get) => ({
  ids: new Set(),
  setInitial: (ids) => set({ ids: new Set(ids) }),
  has: (id) => get().ids.has(id),
  toggle: async (listingId) => {
    const had = get().ids.has(listingId);
    // optimistic update
    set((s) => {
      const next = new Set(s.ids);
      if (had) next.delete(listingId);
      else next.add(listingId);
      return { ids: next };
    });
    try {
      await fetch(`/api/favorites/${listingId}`, { method: had ? "DELETE" : "POST" });
    } catch {
      // revert on failure
      set((s) => {
        const next = new Set(s.ids);
        if (had) next.add(listingId);
        else next.delete(listingId);
        return { ids: next };
      });
    }
  },
}));
