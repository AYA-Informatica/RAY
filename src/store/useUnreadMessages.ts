"use client";

import { create } from "zustand";
import { logger } from "@/lib/logger";

/**
 * Client-side unread message count. Hydrated from the server on first
 * load, then kept fresh by the presence heartbeat and by ChatThread
 * marking messages as read.
 */
interface UnreadMessagesState {
  count: number | null;
  setCount: (n: number) => void;
}

export const useUnreadMessages = create<UnreadMessagesState>((set) => ({
  count: null,
  setCount: (n) => {
    logger.debug({ count: n }, "[useUnreadMessages] setCount called");
    set({ count: n });
  },
}));
