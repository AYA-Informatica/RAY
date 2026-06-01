"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ChatMessage } from "@/components/chat/MessageBubble";

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
          setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
          // Mark as read immediately if we're the recipient (not the sender).
          // The GET endpoint already marks on load; this handles messages arriving
          // while we're actively in the thread.
          void fetch(`/api/chat/messages/read`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ conversationId }),
          }).catch(() => null);
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

  return { messages, loading, appendOptimistic, reload: load };
}
