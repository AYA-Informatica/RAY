"use client";

import { useEffect, useState, useCallback } from "react";
import type { ChatMessage } from "@/components/chat/MessageBubble";
import { useUnreadMessages } from "@/store/useUnreadMessages";
import { useInboxRealtime } from "@/store/useInboxRealtime";
import { logger } from "@/lib/logger";

/**
 * Loads the initial page of messages over the API, then listens for live
 * updates via the shared per-user Broadcast channel (InboxRealtimeSync /
 * useInboxRealtime) — postgres_changes on the RLS-protected Message table
 * doesn't reliably deliver to clients (same issue the inbox sidebar had).
 */
export function useRealtimeMessages(conversationId: string, currentUserId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const lastEvent = useInboxRealtime((s) => s.lastEvent);
  const seq = useInboxRealtime((s) => s.seq);

  const load = useCallback(async () => {
    logger.debug({ conversationId }, "[useRealtimeMessages] loading messages");
    try {
      const res = await fetch(`/api/chat/messages?conversationId=${conversationId}`);
      const json = (await res.json()) as { data?: ChatMessage[] };
      setMessages(json.data ?? []);
      logger.debug({ conversationId, count: json.data?.length ?? 0 }, "[useRealtimeMessages] messages loaded");
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
  }, [load]);

  // Reload messages when the tab becomes visible again — covers both
  // network reconnect (fix 5) and tab-focus scenarios (fix 21).
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") void load();
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [load]);

  useEffect(() => {
    if (!lastEvent) return;
    logger.debug({ type: lastEvent.type, conversationId }, "[useRealtimeMessages] realtime event received");

    switch (lastEvent.type) {
      case "message_insert": {
        const m = lastEvent;
        if (m.conversationId !== conversationId) return;
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
          const real: ChatMessage = {
            id: m.id,
            content: m.content,
            imageUrl: m.imageUrl,
            latitude: m.latitude,
            longitude: m.longitude,
            offerAmount: m.offerAmount,
            offerStatus: m.offerStatus,
            isRead: m.isRead,
            senderId: m.senderId,
            createdAt: m.createdAt,
          };
          if (tempIdx !== -1) {
            const next = [...prev];
            next[tempIdx] = real;
            return next;
          }
          return [...prev, real];
        });
        // Mark as read immediately if we're the recipient (not the sender).
        if (m.senderId !== currentUserId) {
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
        }
        break;
      }
      case "message_read": {
        if (lastEvent.conversationId !== conversationId) return;
        setMessages((prev) =>
          prev.map((x) =>
            x.id === lastEvent.id ? { ...x, isRead: lastEvent.isRead, offerStatus: lastEvent.offerStatus } : x,
          ),
        );
        break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seq]);

  /** Optimistically append a sent message (replaced once the server confirms it). */
  const appendOptimistic = useCallback((m: ChatMessage) => {
    setMessages((prev) => [...prev, m]);
  }, []);

  /** Replace an optimistic placeholder with the confirmed server message. */
  const replaceMessage = useCallback((tempId: string, m: ChatMessage) => {
    setMessages((prev) => prev.map((x) => (x.id === tempId ? m : x)));
  }, []);

  /** Drop an optimistic placeholder whose send failed. */
  const removeMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((x) => x.id !== id));
  }, []);

  /** Patch fields on an existing message (e.g. offer status updates). */
  const updateMessage = useCallback((id: string, patch: Partial<ChatMessage>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }, []);

  return { messages, loading, appendOptimistic, replaceMessage, removeMessage, updateMessage, reload: load };
}
