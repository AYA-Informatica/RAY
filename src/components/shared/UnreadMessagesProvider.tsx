"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUnreadMessages } from "@/store/useUnreadMessages";

/**
 * Hydrates the unread-messages store with the server-computed count on mount,
 * then bumps it live when a new message arrives via Supabase Realtime —
 * so the BottomNav/TopNav badge updates without a page refresh.
 */
export function UnreadMessagesProvider({ initialCount, userId }: { initialCount: number; userId: string }) {
  const setCount = useUnreadMessages((s) => s.setCount);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount, setCount]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`unread:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "Message" },
        (payload) => {
          const m = payload.new as { senderId: string };
          if (m.senderId !== userId) {
            const current = useUnreadMessages.getState().count ?? 0;
            useUnreadMessages.getState().setCount(current + 1);
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  return null;
}
