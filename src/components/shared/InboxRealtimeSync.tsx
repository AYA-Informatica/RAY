"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useInboxRealtime } from "@/store/useInboxRealtime";
import { toUtcIso } from "@/lib/utils/format";
import { logger } from "@/lib/logger";

/**
 * Single shared Supabase Realtime subscription for the inbox. Renders once
 * per chat layout and publishes events to `useInboxRealtime`, which every
 * ConversationList instance (mobile + desktop both render at once) reacts to.
 *
 * Uses a private per-user Broadcast channel ("user:<userId>") populated by
 * DB triggers (see prisma/realtime-broadcast.sql) — unfiltered postgres_changes
 * on the RLS-protected Message/Conversation tables never delivers to clients.
 */
export function InboxRealtimeSync({ userId }: { userId: string }) {
  const emit = useInboxRealtime((s) => s.emit);

  useEffect(() => {
    logger.debug({ userId }, "[InboxRealtimeSync] subscribing to inbox realtime channel");
    const supabase = createClient();
    const topic = `user:${userId}`;
    const fullTopic = `realtime:${topic}`;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    void supabase.realtime.setAuth().then(() => {
      if (cancelled) return;

      for (const existing of supabase.getChannels()) {
        if (existing.topic === fullTopic) void supabase.removeChannel(existing);
      }

      channel = supabase.channel(topic, { config: { private: true } });

      channel
        .on("broadcast", { event: "INSERT" }, (payload) => {
          const data = payload.payload as { table: string; record: Record<string, unknown> };
          logger.debug({ table: data.table }, "[InboxRealtimeSync] broadcast INSERT received");
          if (data.table === "Message") {
            const m = data.record as {
              id: string;
              conversationId: string;
              content: string | null;
              imageUrl: string | null;
              latitude: number | null;
              longitude: number | null;
              offerAmount: number | null;
              offerStatus: string | null;
              isRead: boolean;
              senderId: string;
              createdAt: string;
            };
            emit({ type: "message_insert", ...m, createdAt: toUtcIso(m.createdAt) });
          } else if (data.table === "Conversation") {
            const c = data.record as { id: string; buyerId: string; sellerId: string };
            emit({ type: "conversation_insert", conversationId: c.id, buyerId: c.buyerId, sellerId: c.sellerId });
          }
        })
        .on("broadcast", { event: "UPDATE" }, (payload) => {
          const data = payload.payload as { table: string; record: Record<string, unknown> };
          logger.debug({ table: data.table }, "[InboxRealtimeSync] broadcast UPDATE received");
          if (data.table === "Message") {
            const m = data.record as {
              id: string;
              conversationId: string;
              isRead: boolean;
              senderId: string;
              offerStatus: string | null;
            };
            emit({
              type: "message_read",
              id: m.id,
              conversationId: m.conversationId,
              senderId: m.senderId,
              isRead: m.isRead,
              offerStatus: m.offerStatus,
            });
          } else if (data.table === "Listing") {
            const l = data.record as { id: string; status: string; expiresAt: string };
            emit({ type: "listing_status", listingId: l.id, status: l.status, expiresAt: toUtcIso(l.expiresAt) });
          }
        })
        .subscribe((status) => {
          logger.debug({ userId, status }, "[InboxRealtimeSync] channel subscription status");
        });
    });

    return () => {
      cancelled = true;
      if (channel) void supabase.removeChannel(channel);
    };
  }, [userId, emit]);

  return null;
}
