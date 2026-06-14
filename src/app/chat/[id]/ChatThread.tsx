"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Send, ImagePlus, MapPin, Loader2, MoreVertical, Ban, MessageSquare, Tag } from "lucide-react";
import { MessageBubble, type ChatMessage } from "@/components/chat/MessageBubble";
import { QuickReplies } from "@/components/chat/QuickReplies";
import { PriceTag } from "@/components/listings/PriceTag";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { usePresenceHeartbeat } from "@/hooks/usePresenceHeartbeat";
import { createClient } from "@/lib/supabase/client";
import { uploadImage } from "@/lib/storage/upload";
import { cn } from "@/lib/utils/cn";
import { isOnline, presenceLabel, formatPrice, toUtcIso } from "@/lib/utils/format";
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
  const { messages, loading, appendOptimistic, replaceMessage, removeMessage, updateMessage } = useRealtimeMessages(
    thread.conversationId,
    currentUserId,
  );
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(thread.isBlocked);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showOfferInput, setShowOfferInput] = useState(false);
  const [offerValue, setOfferValue] = useState("");
  const isSeller = thread.sellerId === currentUserId;
  const [otherLastSeenAt, setOtherLastSeenAt] = useState(thread.otherLastSeenAt);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Live presence: reflect the other user's online/last-seen status as it changes.
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`presence:${thread.otherId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "User", filter: `id=eq.${thread.otherId}` },
        (payload) => {
          const u = payload.new as { lastSeenAt: string };
          setOtherLastSeenAt(toUtcIso(u.lastSeenAt));
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [thread.otherId]);

  async function send(payload: {
    content?: string;
    imageUrl?: string;
    latitude?: number;
    longitude?: number;
    offerAmount?: number;
  }) {
    if (blocked) return;
    setSending(true);
    setSendError(null);
    const tempId = `temp-${Date.now()}`;
    appendOptimistic({
      id: tempId,
      content: payload.content ?? null,
      imageUrl: payload.imageUrl ?? null,
      latitude: payload.latitude ?? null,
      longitude: payload.longitude ?? null,
      offerAmount: payload.offerAmount ?? null,
      offerStatus: payload.offerAmount != null ? "pending" : null,
      isRead: false,
      senderId: currentUserId,
      createdAt: new Date().toISOString(),
    });
    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: thread.conversationId, ...payload }),
      });
      const json = (await res.json()) as { data?: ChatMessage };
      if (json.data) {
        replaceMessage(tempId, json.data);
      } else {
        removeMessage(tempId);
        setSendError(t("chat.sendFailed"));
      }
    } catch {
      removeMessage(tempId);
      setSendError(t("chat.sendFailed"));
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
    if (locating) return;
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError(t("chat.locationUnavailable"));
      return;
    }
    // Geolocation is silently unavailable on insecure (non-HTTPS, non-localhost)
    // origins on most mobile browsers — surface that immediately instead of
    // spinning forever.
    if (!window.isSecureContext) {
      setLocationError(t("chat.locationInsecure"));
      return;
    }
    setLocating(true);
    // Belt-and-braces: some mobile browsers never call either callback if the
    // location prompt is dismissed in certain ways. Stop the spinner either way.
    const fallback = setTimeout(() => {
      setLocating(false);
      setLocationError(t("chat.locationUnavailable"));
    }, 16000);
    // A single call, made synchronously in this click handler so it counts as
    // "in response to a user gesture" on mobile. GPS (enableHighAccuracy: true)
    // is used directly since network/wifi positioning has been unreliable on
    // some devices (returns POSITION_UNAVAILABLE).
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(fallback);
        setLocating(false);
        void send({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      },
      (err) => {
        clearTimeout(fallback);
        setLocating(false);
        setLocationError(
          err.code === err.PERMISSION_DENIED ? t("chat.locationDenied") : t("chat.locationUnavailable"),
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
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

  const online = isOnline(otherLastSeenAt);

  return (
    <div className="fixed inset-0 z-40 mx-auto flex h-dvh w-full max-w-md flex-col bg-background sm:max-w-xl md:max-w-2xl lg:static lg:inset-auto lg:z-auto lg:mx-0 lg:h-full lg:w-auto lg:max-w-none lg:border-x-0">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background px-3 py-2.5">
        {/* Back arrow — mobile only; desktop sidebar provides navigation */}
        <Link
          href="/chat"
          aria-label={t("common.back")}
          className="-ml-2 grid h-11 w-11 place-items-center text-text-secondary hover:text-text-primary lg:hidden"
        >
          <ArrowLeft size={22} />
        </Link>
        <Link href={`/listing/${thread.listingId}`} target="_blank" rel="noopener noreferrer" className="flex min-w-0 flex-1 items-center gap-2">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-surface-modal">
            {thread.listingImage ? (
              <Image src={thread.listingImage} alt={thread.listingTitle} fill className="object-cover" sizes="40px" />
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
              {online ? t("chat.online") : presenceLabel(otherLastSeenAt)}
            </p>
          </div>
        </Link>
        <PriceTag amount={thread.listingPrice} size="sm" />

        {/* Overflow menu: block / unblock */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="More options"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="grid h-11 w-11 place-items-center text-text-secondary hover:text-text-primary"
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
          <div className="space-y-3 p-4">
            <div className="grid place-items-center py-6 text-center text-sm text-text-muted">
              <p>{t("chat.sayHello")}</p>
            </div>
            {/* Safety tip — shown only on empty threads, matches OLX's trust layer */}
            <div className="rounded-xl border border-border bg-surface-card px-4 py-3">
              <p className="text-xs font-semibold text-text-secondary">🛡️ {t("chat.safetyTip")}</p>
              <p className="mt-0.5 text-xs text-text-muted">{t("chat.safetyBody")}</p>
            </div>
          </div>
        ) : (
          messages.map((m: ChatMessage) => (
            <MessageBubble
              key={m.id}
              message={m}
              mine={m.senderId === currentUserId}
              isSeller={isSeller}
              onOfferRespond={(msgId, status) => {
                updateMessage(msgId, { offerStatus: status });
              }}
            />
          ))
        )}
        <div ref={endRef} />
      </main>

      {/* Footer: composer + privacy note */}
      <footer className="sticky bottom-0 border-t border-border bg-background">
        {(locationError || sendError) && (
          <p className="border-b border-border/50 px-4 py-1.5 text-center text-[11px] text-danger">
            {locationError || sendError}
          </p>
        )}
        {/* Privacy note — persistent, matches OLX's trust layer */}
        <p className="border-b border-border/50 px-4 py-1.5 text-center text-[11px] text-text-muted">
          🔒 {t("chat.privacyNote")}
        </p>
        {blocked ? (
          <div className="flex items-center justify-between gap-3 p-4">
            <p className="text-sm text-text-secondary">{t("chat.blocked")}</p>
            <button onClick={toggleBlock} className="shrink-0 text-sm font-medium text-primary">
              {t("chat.unblock")}
            </button>
          </div>
        ) : (
          <>
            {showQuickReplies && (
              <QuickReplies onPick={(msg) => { void send({ content: msg }); setShowQuickReplies(false); }} />
            )}
            {/* Offer input — buyer only, hidden from seller */}
            {showOfferInput && !isSeller && (
              <div className="flex items-center gap-2 border-t border-border px-3 py-2">
                <span className="shrink-0 text-sm font-medium text-text-secondary">Rwf</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={offerValue}
                  onChange={(e) => setOfferValue(e.target.value)}
                  placeholder={`${t("offer.placeholder")} (${formatPrice(thread.listingPrice)})`}
                  className="h-10 flex-1 rounded-md border border-border bg-surface-modal px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={() => {
                    const amount = parseFloat(offerValue);
                    if (!isNaN(amount) && amount > 0) {
                      void send({ offerAmount: amount });
                      setOfferValue("");
                      setShowOfferInput(false);
                    }
                  }}
                  disabled={!offerValue || isNaN(parseFloat(offerValue))}
                  className="rounded-md bg-primary px-3 py-2 text-xs font-semibold text-text-primary disabled:opacity-50"
                >
                  {t("offer.sendOffer")}
                </button>
                <button onClick={() => setShowOfferInput(false)} className="text-xs text-text-muted hover:text-text-primary">
                  {t("common.cancel")}
                </button>
              </div>
            )}
            <div className="flex items-center gap-1 p-2 sm:gap-2 sm:p-3">
              <label className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-pill text-text-secondary hover:text-text-primary sm:h-10 sm:w-10">
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
                disabled={locating}
                aria-label="Share location"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-pill text-text-secondary hover:text-text-primary disabled:opacity-50 sm:h-10 sm:w-10"
              >
                {locating ? <Loader2 size={20} className="animate-spin" /> : <MapPin size={20} />}
              </button>
              {/* Quick replies toggle */}
              <button
                onClick={() => setShowQuickReplies((v) => !v)}
                aria-label="Quick replies"
                aria-pressed={showQuickReplies}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-pill text-text-secondary hover:text-text-primary sm:h-10 sm:w-10"
              >
                <MessageSquare size={18} />
              </button>
              {/* Make Offer — only shown to the buyer */}
              {!isSeller && (
                <button
                  onClick={() => { setShowOfferInput((v) => !v); setShowQuickReplies(false); }}
                  aria-label="Make an offer"
                  aria-pressed={showOfferInput}
                  className={cn(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-pill transition-colors sm:h-10 sm:w-10",
                    showOfferInput ? "bg-primary/20 text-primary" : "text-text-secondary hover:text-text-primary",
                  )}
                  title="Make an offer"
                >
                  <Tag size={18} />
                </button>
              )}
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
                className="h-10 min-w-0 flex-1 rounded-pill border border-border bg-surface-modal px-3 text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none sm:h-11 sm:px-4"
              />
              <button
                onClick={() => void sendText()}
                disabled={sending || !text.trim()}
                aria-label="Send"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-pill bg-primary text-text-primary disabled:opacity-50 sm:h-11 sm:w-11"
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
