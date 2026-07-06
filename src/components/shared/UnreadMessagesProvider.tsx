"use client";

import { useEffect } from "react";
import { useUnreadMessages } from "@/store/useUnreadMessages";
import { useInboxRealtime } from "@/store/useInboxRealtime";
import { logger } from "@/lib/logger";

/**
 * Hydrates the unread-messages store with the server-computed count on mount,
 * then bumps it live when a new message arrives — so the BottomNav/TopNav
 * badge updates without a page refresh. Live updates come from the shared
 * broadcast subscription in InboxRealtimeSync via useInboxRealtime.
 */
export function UnreadMessagesProvider({ initialCount, userId }: { initialCount: number; userId: string }) {
  const setCount = useUnreadMessages((s) => s.setCount);
  const lastEvent = useInboxRealtime((s) => s.lastEvent);
  const seq = useInboxRealtime((s) => s.seq);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount, setCount]);

  useEffect(() => {
    if (!lastEvent) return;
    if (lastEvent.type === "message_insert" && lastEvent.senderId !== userId) {
      const current = useUnreadMessages.getState().count ?? 0;
      logger.debug({ from: current, to: current + 1 }, "[UnreadMessagesProvider] unread count bumped");
      useUnreadMessages.getState().setCount(current + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seq]);

  return null;
}
