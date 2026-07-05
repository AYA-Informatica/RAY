"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Condition } from "@prisma/client";
import { safeLocalStorage } from "@/lib/safeStorage";

/** In-memory + localStorage draft for the multi-step Sell flow. */
export interface SellDraft {
  categoryId: string;
  images: string[];
  title: string;
  price: string;
  negotiable: boolean;
  condition: Condition | "";
  description: string;
  city: string;
  district: string;
  neighborhood: string;
  latitude?: number;
  longitude?: number;
  attributes: Record<string, string>;
  /** Unix ms timestamp of the last change — used to expire stale drafts. */
  savedAt?: number;
}

const empty: SellDraft = {
  categoryId: "",
  images: [],
  title: "",
  price: "",
  negotiable: true,
  condition: "",
  description: "",
  city: "Kigali",
  district: "",
  neighborhood: "",
  attributes: {},
};

interface SellDraftState {
  draft: SellDraft;
  step: number;
  set: (patch: Partial<SellDraft>) => void;
  setStep: (step: number) => void;
  reset: () => void;
}

const DRAFT_TTL_MS = 48 * 60 * 60 * 1000; // 48 hours

/**
 * Sell wizard draft — persisted to localStorage so a draft survives:
 *  - accidental tab close mid-upload
 *  - network failure between steps
 *  - leaving the wizard and coming back
 *
 * Drafts older than 48 hours are discarded on load to avoid stale ghosts.
 * `reset()` clears both store and localStorage (called after successful post).
 */
export const useSellDraft = create<SellDraftState>()(
  persist(
    (set) => ({
      draft: { ...empty },
      step: 0,
      set: (patch) =>
        set((s) => ({ draft: { ...s.draft, ...patch, savedAt: Date.now() } })),
      setStep: (step) => set({ step }),
      reset: () => set({ draft: { ...empty }, step: 0 }),
    }),
    {
      name: "ray_sell_draft",
      storage: createJSONStorage(safeLocalStorage),
      // Don't persist the step — always land at step 0 so the user
      // reviews their draft before continuing.
      partialize: (s) => ({ draft: s.draft }),
      // On hydration, discard drafts that are older than the TTL so
      // stale entries don't ghost the wizard indefinitely.
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const { savedAt } = state.draft;
        if (savedAt && Date.now() - savedAt > DRAFT_TTL_MS) {
          state.reset();
        }
      },
    },
  ),
);
