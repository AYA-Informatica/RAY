"use client";

import { create } from "zustand";
import type { Condition } from "@prisma/client";

/** In-memory draft for the multi-step Sell flow (no browser storage). */
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
  attributes: Record<string, string>; // attributeId -> value
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

export const useSellDraft = create<SellDraftState>((set) => ({
  draft: { ...empty },
  step: 0,
  set: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),
  setStep: (step) => set({ step }),
  reset: () => set({ draft: { ...empty }, step: 0 }),
}));
