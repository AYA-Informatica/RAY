"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Condition } from "@prisma/client";

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

/**
 * Sell wizard draft — persisted to localStorage so a draft survives:
 *  - accidental tab close mid-upload
 *  - network failure between steps
 *  - leaving the wizard and coming back
 *
 * `reset()` clears both store and localStorage (called after successful post).
 */
export const useSellDraft = create<SellDraftState>()(
  persist(
    (set) => ({
      draft: { ...empty },
      step: 0,
      set: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),
      setStep: (step) => set({ step }),
      reset: () => set({ draft: { ...empty }, step: 0 }),
    }),
    {
      name: "ray_sell_draft",
      storage: createJSONStorage(() => {
        // Safe SSR: fall back to a no-op store on the server.
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => undefined,
            removeItem: () => undefined,
          };
        }
        return localStorage;
      }),
      // Don't persist the step — always start from where the images/details are,
      // but drop back to step 0 so the user can review before posting again.
      partialize: (s) => ({ draft: s.draft }),
    },
  ),
);
