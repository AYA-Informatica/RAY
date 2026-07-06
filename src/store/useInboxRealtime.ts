"use client";

import { create } from "zustand";
import { logger } from "@/lib/logger";

export type InboxRealtimeEvent =
  | { type: "conversation_insert"; conversationId: string; buyerId: string; sellerId: string }
  | {
      type: "message_insert";
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
    }
  | {
      type: "message_read";
      id: string;
      conversationId: string;
      senderId: string;
      isRead: boolean;
      offerStatus: string | null;
    }
  | { type: "listing_status"; listingId: string; status: string; expiresAt: string };

/**
 * Shared inbox realtime event bus. A single Supabase subscription
 * (InboxRealtimeSync) publishes events here; every ConversationList
 * instance (mobile + desktop both render at once) reacts to `seq` changes
 * and applies `lastEvent` to its own local list.
 *
 * A single shared subscription is required because Supabase only
 * delivers postgres_changes broadcasts to one of several duplicate
 * subscriptions (same table/event, no filter) opened from the same client.
 */
interface InboxRealtimeState {
  lastEvent: InboxRealtimeEvent | null;
  seq: number;
  emit: (event: InboxRealtimeEvent) => void;
}

export const useInboxRealtime = create<InboxRealtimeState>((set) => ({
  lastEvent: null,
  seq: 0,
  emit: (event) => {
    logger.debug({ type: event.type }, "[useInboxRealtime] emit called");
    set((s) => ({ lastEvent: event, seq: s.seq + 1 }));
  },
}));
