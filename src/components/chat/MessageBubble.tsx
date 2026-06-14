"use client";

import Image from "next/image";
import { Check, CheckCheck, MapPin, Tag, ThumbsUp, ThumbsDown, Loader2, X, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { timeAgo, formatPrice } from "@/lib/utils/format";

export interface ChatMessage {
  id: string;
  content: string | null;
  imageUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  offerAmount: number | null;
  offerStatus: string | null; // "pending" | "accepted" | "declined" | null
  isRead: boolean;
  senderId: string;
  createdAt: string | Date;
}

/**
 * Renders a single chat message. Supports text, image, location pin,
 * and price offer cards (OLX-style "Make Offer" feature).
 */
export function MessageBubble({
  message,
  mine,
  isSeller,
  onOfferRespond,
}: {
  message: ChatMessage;
  mine: boolean;
  /** True when the viewer is the listing seller — only they can accept/decline. */
  isSeller?: boolean;
  onOfferRespond?: (messageId: string, status: "accepted" | "declined") => void;
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Let the mobile/browser back button close the lightbox instead of
  // navigating away from the chat. Pushes a history entry while open and
  // closes on popstate; closing via the X also unwinds that entry.
  useEffect(() => {
    if (!lightboxOpen) return;
    history.pushState({ lightbox: true }, "");
    const onPopState = () => setLightboxOpen(false);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
    };
    window.addEventListener("popstate", onPopState);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxOpen]);

  function closeLightbox() {
    setLightboxOpen(false);
    if (history.state?.lightbox) history.back();
  }

  async function downloadImage(url: string) {
    if (downloading) return;
    setDownloading(true);
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const ext = url.split(/[#?]/)[0]?.split(".").pop() || "jpg";
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `ray-photo-${Date.now()}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    } catch {
      window.open(url, "_blank");
    } finally {
      setDownloading(false);
    }
  }

  const isOffer = message.offerAmount != null;

  if (isOffer) {
    return (
      <OfferCard
        message={message}
        mine={mine}
        isSeller={isSeller ?? false}
        onRespond={onOfferRespond}
      />
    );
  }

  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[78%] rounded-lg px-3 py-2",
          mine
            ? "rounded-br-sm bg-primary text-text-primary"
            : "rounded-bl-sm bg-surface-card text-text-primary",
        )}
      >
        {message.imageUrl && (
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            aria-label="View photo"
            className="relative mb-1 block h-40 w-48 overflow-hidden rounded-md bg-surface-modal"
          >
            <Image src={message.imageUrl} alt="Shared photo" fill className="object-cover" sizes="192px" />
          </button>
        )}
        {message.latitude != null && message.longitude != null && (
          <a
            href={`https://maps.google.com/?q=${message.latitude},${message.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-1 flex items-center gap-1 text-sm underline"
          >
            <MapPin size={14} /> Shared location
          </a>
        )}
        {message.content && (
          <p className="whitespace-pre-wrap text-sm">{message.content}</p>
        )}
        <div
          suppressHydrationWarning
          className={cn(
            "mt-0.5 flex items-center justify-end gap-1 text-[10px]",
            mine ? "text-text-primary/70" : "text-text-muted",
          )}
        >
          {timeAgo(message.createdAt)}
          {mine && (message.isRead ? <CheckCheck size={13} /> : <Check size={13} />)}
        </div>
      </div>

      {lightboxOpen && message.imageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={closeLightbox}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={closeLightbox}
            className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-black/50 text-white"
          >
            <X size={20} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              void downloadImage(message.imageUrl!);
            }}
            disabled={downloading}
            aria-label="Download photo"
            className="absolute left-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-black/50 text-white disabled:opacity-50"
          >
            {downloading ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
          </button>
          <div className="relative h-full w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <Image src={message.imageUrl} alt="Shared photo" fill className="object-contain" sizes="100vw" />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Offer card — shown when a buyer taps "Make Offer".
 *
 * States:
 *   pending  → seller sees Accept / Decline buttons; buyer sees "awaiting response".
 *   accepted → both see a green accepted card.
 *   declined → both see a muted declined card.
 */
function OfferCard({
  message,
  mine,
  isSeller,
  onRespond,
}: {
  message: ChatMessage;
  mine: boolean;
  isSeller: boolean;
  onRespond?: (messageId: string, status: "accepted" | "declined") => void;
}) {
  const [responding, setResponding] = useState(false);
  const status = message.offerStatus as "pending" | "accepted" | "declined" | null;

  const statusColor =
    status === "accepted"
      ? "border-success/40 bg-success/10"
      : status === "declined"
        ? "border-border bg-surface-modal opacity-70"
        : "border-primary/40 bg-primary/10";

  async function respond(s: "accepted" | "declined") {
    setResponding(true);
    try {
      await fetch("/api/chat/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: message.id, status: s }),
      });
      onRespond?.(message.id, s);
    } finally {
      setResponding(false);
    }
  }

  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div className={cn("w-56 rounded-xl border p-3", statusColor)}>
        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
          <Tag size={12} />
          {mine ? "Your offer" : "Offer from buyer"}
        </div>
        <p className="mt-1 font-display text-xl font-bold text-text-primary">
          {formatPrice(message.offerAmount!)}
        </p>
        {status === "accepted" && (
          <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-success">
            <ThumbsUp size={13} /> Offer accepted
          </p>
        )}
        {status === "declined" && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-text-muted">
            <ThumbsDown size={13} /> Offer declined
          </p>
        )}
        {status === "pending" && isSeller && !mine && (
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => void respond("accepted")}
              disabled={responding}
              className="flex flex-1 items-center justify-center gap-1 rounded-md bg-success/20 py-1.5 text-xs font-semibold text-success hover:bg-success/30 disabled:opacity-50"
            >
              {responding ? <Loader2 size={12} className="animate-spin" /> : <ThumbsUp size={12} />}
              Accept
            </button>
            <button
              onClick={() => void respond("declined")}
              disabled={responding}
              className="flex flex-1 items-center justify-center gap-1 rounded-md bg-surface-modal py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-card disabled:opacity-50"
            >
              <ThumbsDown size={12} /> Decline
            </button>
          </div>
        )}
        {status === "pending" && mine && (
          <p className="mt-1.5 text-xs text-text-muted">Waiting for seller's response…</p>
        )}
        <div suppressHydrationWarning className="mt-2 text-right text-[10px] text-text-muted">{timeAgo(message.createdAt)}</div>
      </div>
    </div>
  );
}
