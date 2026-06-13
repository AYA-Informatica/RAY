"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ChatMessage } from "@/components/chat/MessageBubble";
import { useUnreadMessages } from "@/store/useUnreadMessages";

/**
 * Subscribes to new messages in a conversation via Supabase Realtime.
 * Loads the initial page over the API, then listens for INSERTs on Message.
 */
export function useRealtimeMessages(conversationId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat/messages?conversationId=${conversationId}`);
      const json = (await res.json()) as { data?: ChatMessage[] };
      setMessages(json.data ?? []);
      const unreadHeader = res.headers.get("X-Unread-Count");
      if (unreadHeader !== null) {
        useUnreadMessages.getState().setCount(Number(unreadHeader));
      }
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    void load();
    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "Message", filter: `conversationId=eq.${conversationId}` },
        (payload) => {
          const m = payload.new as ChatMessage;
          setMessages((prev) => {
            if (prev.some((x) => x.id === m.id)) return prev;
            // Replace the optimistic placeholder for this send (if any) instead of
            // appending a second bubble — matched by sender + payload since the
            // placeholder's temp id never matches the real DB id.
            const tempIdx = prev.findIndex(
              (x) =>
                x.id.startsWith("temp-") &&
                x.senderId === m.senderId &&
                x.content === m.content &&
                x.imageUrl === m.imageUrl &&
                x.offerAmount === m.offerAmount &&
                x.latitude === m.latitude,
            );
            if (tempIdx !== -1) {
              const next = [...prev];
              next[tempIdx] = m;
              return next;
            }
            return [...prev, m];
          });
          // Mark as read immediately if we're the recipient (not the sender).
          // The GET endpoint already marks on load; this handles messages arriving
          // while we're actively in the thread.
          void fetch(`/api/chat/messages/read`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ conversationId }),
          })
            .then((r) => r.json())
            .then((json: { data?: { unreadCount?: number } }) => {
              if (typeof json.data?.unreadCount === "number") {
                useUnreadMessages.getState().setCount(json.data.unreadCount);
              }
            })
            .catch(() => null);
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "Message", filter: `conversationId=eq.${conversationId}` },
        (payload) => {
          const m = payload.new as ChatMessage;
          setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, ...m } : x)));
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversationId, load]);

  /** Optimistically append a sent message (replaced when realtime echoes it). */
  const appendOptimistic = useCallback((m: ChatMessage) => {
    setMessages((prev) => [...prev, m]);
  }, []);

  /** Patch fields on an existing message (e.g. offer status updates). */
  const updateMessage = useCallback((id: string, patch: Partial<ChatMessage>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }, []);

  return { messages, loading, appendOptimistic, updateMessage, reload: load };
}
