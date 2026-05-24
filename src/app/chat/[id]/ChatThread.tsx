"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Send, ImagePlus, MapPin, Loader2, MoreVertical, Ban } from "lucide-react";
import { MessageBubble, type ChatMessage } from "@/components/chat/MessageBubble";
import { QuickReplies } from "@/components/chat/QuickReplies";
import { PriceTag } from "@/components/listings/PriceTag";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { usePresenceHeartbeat } from "@/hooks/usePresenceHeartbeat";
import { uploadImage } from "@/lib/storage/upload";
import { isOnline, presenceLabel } from "@/lib/utils/format";
import { useI18n } from "@/i18n/I18nProvider";
import type { ThreadHeader } from "@/services/chat";

/**
 * Chat thread: realtime messages, transaction-oriented quick replies,
 * text + image + location sharing, online/last-seen presence, and block.
 * Phone numbers stay hidden (shared manually in-message only).
 */
export function ChatThread({
  thread,
  currentUserId,
}: {
  thread: ThreadHeader;
  currentUserId: string;
}) {
  usePresenceHeartbeat();
  const { t } = useI18n();
  const { messages, loading, appendOptimistic } = useRealtimeMessages(thread.conversationId);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [blocked, setBlocked] = useState(thread.isBlocked);
  const [menuOpen, setMenuOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function send(payload: {
    content?: string;
    imageUrl?: string;
    latitude?: number;
    longitude?: number;
  }) {
    if (blocked) return;
    setSending(true);
    appendOptimistic({
      id: `temp-${Date.now()}`,
      content: payload.content ?? null,
      imageUrl: payload.imageUrl ?? null,
      latitude: payload.latitude ?? null,
      longitude: payload.longitude ?? null,
      isRead: false,
      senderId: currentUserId,
      createdAt: new Date().toISOString(),
    });
    try {
      await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: thread.conversationId, ...payload }),
      });
    } finally {
      setSending(false);
    }
  }

  async function sendText() {
    const content = text.trim();
    if (!content) return;
    setText("");
    await send({ content });
  }

  async function sendImage(file: File) {
    setUploading(true);
    try {
      const url = await uploadImage(file, "chat-images", currentUserId);
      await send({ imageUrl: url });
    } catch {
      /* no bubble persists on failure */
    } finally {
      setUploading(false);
    }
  }

  function shareLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) =>
      send({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
    );
  }

  async function toggleBlock() {
    setMenuOpen(false);
    const next = !blocked;
    setBlocked(next); // optimistic
    try {
      await fetch(`/api/blocks/${thread.otherId}`, { method: next ? "POST" : "DELETE" });
    } catch {
      setBlocked(!next); // revert
    }
  }

  const online = isOnline(thread.otherLastSeenAt);

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background px-3 py-2.5">
        <Link href="/chat" aria-label={t("common.back")} className="text-text-secondary">
          <ArrowLeft size={22} />
        </Link>
        <Link href={`/listing/${thread.listingId}`} className="flex min-w-0 flex-1 items-center gap-2">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-surface-modal">
            {thread.listingImage ? (
              <Image src={thread.listingImage} alt={thread.listingTitle} fill className="object-cover" />
            ) : (
              <span className="grid h-full w-full place-items-center">📦</span>
            )}
            {online && (
              <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-pill border-2 border-background bg-success" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-text-primary">{thread.otherName}</p>
            <p className={`truncate text-xs ${online ? "text-success" : "text-text-secondary"}`}>
              {online ? t("chat.online") : presenceLabel(thread.otherLastSeenAt)}
            </p>
          </div>
        </Link>
        <PriceTag amount={thread.listingPrice} size="sm" />

        {/* Overflow menu: block / unblock */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="More options"
            className="text-text-secondary"
          >
            <MoreVertical size={20} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 z-20 w-44 overflow-hidden rounded-md border border-border bg-surface-modal shadow-modal">
              <button
                onClick={toggleBlock}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-danger hover:bg-surface-card"
              >
                <Ban size={16} /> {blocked ? t("chat.unblock") : t("chat.block")}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 space-y-2 overflow-y-auto p-3">
        {loading ? (
          <div className="grid place-items-center py-10 text-text-muted">
            <Loader2 className="animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="grid place-items-center py-10 text-center text-sm text-text-muted">
            <p>{t("chat.sayHello")}</p>
          </div>
        ) : (
          messages.map((m: ChatMessage) => (
            <MessageBubble key={m.id} message={m} mine={m.senderId === currentUserId} />
          ))
        )}
        <div ref={endRef} />
      </main>

      {/* Quick replies + composer (or blocked notice) */}
      <footer className="sticky bottom-0 border-t border-border bg-background">
        {blocked ? (
          <div className="flex items-center justify-between gap-3 p-4">
            <p className="text-sm text-text-secondary">{t("chat.blocked")}</p>
            <button onClick={toggleBlock} className="shrink-0 text-sm font-medium text-primary">
              {t("chat.unblock")}
            </button>
          </div>
        ) : (
          <>
            {messages.length === 0 && <QuickReplies onPick={(msg) => void send({ content: msg })} />}
            <div className="flex items-center gap-2 p-3">
              <label className="grid h-10 w-10 cursor-pointer place-items-center rounded-pill text-text-secondary hover:text-text-primary">
                {uploading ? <Loader2 size={20} className="animate-spin" /> : <ImagePlus size={20} />}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && sendImage(e.target.files[0])}
                  disabled={uploading}
                />
              </label>
              <button
                onClick={shareLocation}
                aria-label="Share location"
                className="grid h-10 w-10 place-items-center rounded-pill text-text-secondary hover:text-text-primary"
              >
                <MapPin size={20} />
              </button>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void sendText();
                  }
                }}
                placeholder={t("chat.typeMessage")}
                className="h-11 flex-1 rounded-pill border border-border bg-surface-modal px-4 text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
              />
              <button
                onClick={() => void sendText()}
                disabled={sending || !text.trim()}
                aria-label="Send"
                className="grid h-11 w-11 place-items-center rounded-pill bg-primary text-text-primary disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </>
        )}
      </footer>
    </div>
  );
}
