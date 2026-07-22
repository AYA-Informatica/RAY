"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { ChatMessage } from "@/components/chat/MessageBubble";
import { useUnreadMessages } from "@/store/useUnreadMessages";
import { useInboxRealtime } from "@/store/useInboxRealtime";
import { logger } from "@/lib/logger";

const PAGE_SIZE = 50;

/**
 * Loads the newest page of messages over the API, then listens for live
 * updates via the shared per-user Broadcast channel (InboxRealtimeSync /
 * useInboxRealtime) — postgres_changes on the RLS-protected Message table
 * doesn't reliably deliver to clients (same issue the inbox sidebar had).
 *
 * Paginated 50/page (mirrors the mobile app's "Load earlier"). `load()` only
 * ever fetches the newest page and merges it into existing state rather than
 * replacing it, so a tab-focus/reconnect refresh never discards older pages
 * the user has already paged back through.
 */
export function useRealtimeMessages(conversationId: string, currentUserId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const lastEvent = useInboxRealtime((s) => s.lastEvent);
  const seq = useInboxRealtime((s) => s.seq);
  // Tracks whether load() has ever completed, independent of React state
  // timing — see the note below on why this can't be a `messages.length === 0`
  // check inside the updater.
  const hasLoadedOnceRef = useRef(false);

  const load = useCallback(async () => {
    logger.debug({ conversationId }, "[useRealtimeMessages] loading messages");
    try {
      const res = await fetch(`/api/chat/messages?conversationId=${conversationId}&page=1&limit=${PAGE_SIZE}`);
      const json = (await res.json()) as { data?: ChatMessage[] };
      const fresh = json.data ?? [];
      const isFirstLoad = !hasLoadedOnceRef.current;
      hasLoadedOnceRef.current = true;
      setMessages((prev) => {
        if (prev.length === 0) return fresh;
        // Refresh (tab-focus/reconnect), not first load — merge in anything
        // new rather than discarding earlier pages already loaded.
        const existingIds = new Set(prev.map((x) => x.id));
        const newOnes = fresh.filter((x) => !existingIds.has(x.id));
        return newOnes.length > 0 ? [...prev, ...newOnes] : prev;
      });
      // Only establish the pagination cursor on the very first load. A later
      // refresh (tab-focus/reconnect) must not reset page/hasMore back to 1 —
      // load() always requests page 1 regardless of how many older pages the
      // user has already fetched via loadEarlier(), so resetting here would
      // make the next "Load earlier" click re-fetch pages already merged in
      // (silently deduped as "nothing new") instead of reaching real new content.
      if (isFirstLoad) {
        setPage(1);
        setHasMore(fresh.length === PAGE_SIZE);
      }
      logger.debug({ conversationId, count: fresh.length }, "[useRealtimeMessages] messages loaded");
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

  /** Fetch the next-older page and prepend it. */
  const loadEarlier = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/chat/messages?conversationId=${conversationId}&page=${nextPage}&limit=${PAGE_SIZE}`);
      const json = (await res.json()) as { data?: ChatMessage[] };
      const older = json.data ?? [];
      if (older.length > 0) {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((x) => x.id));
          const newOnes = older.filter((x) => !existingIds.has(x.id));
          return [...newOnes, ...prev];
        });
        setPage(nextPage);
        setHasMore(older.length === PAGE_SIZE);
      } else {
        setHasMore(false);
      }
    } finally {
      setLoadingMore(false);
    }
  }, [conversationId, page, hasMore, loadingMore]);

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

  return {
    messages, loading, appendOptimistic, replaceMessage, removeMessage, updateMessage, reload: load,
    hasMore, loadingMore, loadEarlier,
  };
}
