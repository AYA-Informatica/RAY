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
    set((s) => {
      const next = new Set(s.ids);
      if (had) next.delete(listingId); else next.add(listingId);
      return { ids: next };
    });
    try {
      const res = await fetch(`/api/favorites/${listingId}`, { method: had ? "DELETE" : "POST" });
      if (res.status === 401) {
        // Not signed in — revert and redirect to login.
        set((s) => {
          const next = new Set(s.ids);
          if (had) next.add(listingId); else next.delete(listingId);
          return { ids: next };
        });
        window.location.href = `/login?redirect=/listing/${listingId}`;
        return;
      }
    } catch {
      set((s) => {
        const next = new Set(s.ids);
        if (had) next.add(listingId); else next.delete(listingId);
        return { ids: next };
      });
    }
  },
}));
