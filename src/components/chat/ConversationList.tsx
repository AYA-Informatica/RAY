"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { timeAgo } from "@/lib/utils/format";
import { useI18n } from "@/i18n/I18nProvider";
import { Badge } from "@/components/ui/Badge";
import { STATUS_TONE, STATUS_KEY } from "@/lib/listings/status";
import { useInboxRealtime } from "@/store/useInboxRealtime";
import { logger } from "@/lib/logger";

export interface ConversationPreview {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImage: string | null;
  listingStatus: string;
  otherName: string;
  otherAvatar: string | null;
  lastMessage: string | null;
  lastMessageType: "text" | "image" | "location" | "offer" | null;
  lastAt: string | Date;
  unread: number;
}

/** Inbox conversation list with client-side search and live updates. */
export function ConversationList({
  conversations: initialConversations,
  currentUserId,
}: {
  conversations: ConversationPreview[];
  currentUserId: string;
}) {
  const [conversations, setConversations] = useState(initialConversations);
  const [query, setQuery] = useState("");
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { t } = useI18n();
  const lastEvent = useInboxRealtime((s) => s.lastEvent);
  const seq = useInboxRealtime((s) => s.seq);

  // Live preview/unread updates: new messages bump the conversation to the top
  // and update its preview; read receipts clear its unread badge; brand-new
  // conversations are fetched and prepended as they arrive. Events come from
  // the single shared subscription in InboxRealtimeSync via useInboxRealtime
  // — mobile and desktop both render a ConversationList at once, and Supabase
  // only delivers postgres_changes to one of several duplicate subscriptions.
  useEffect(() => {
    if (!lastEvent) return;
    logger.debug({ type: lastEvent.type }, "[ConversationList] realtime event received");

    /** Fetch and prepend a conversation that isn't in the list yet (no-op if already present). */
    function addConversationIfMissing(conversationId: string) {
      setConversations((prev) => {
        if (prev.some((c) => c.id === conversationId)) return prev;
        void fetch(`/api/chat/conversations/${conversationId}`)
          .then((r) => r.json())
          .then((json: { data?: ConversationPreview }) => {
            if (!json.data) return;
            logger.debug({ conversationId }, "[ConversationList] new conversation fetched and prepended");
            setConversations((cur) =>
              cur.some((c) => c.id === conversationId) ? cur : [json.data!, ...cur],
            );
          })
          .catch((err) => logger.warn({ conversationId, err }, "[ConversationList] failed to fetch new conversation"));
        return prev;
      });
    }

    switch (lastEvent.type) {
      case "conversation_insert": {
        if (lastEvent.buyerId !== currentUserId && lastEvent.sellerId !== currentUserId) return;
        addConversationIfMissing(lastEvent.conversationId);
        break;
      }
      case "message_insert": {
        const m = lastEvent;
        setConversations((prev) => {
          const idx = prev.findIndex((c) => c.id === m.conversationId);
          if (idx === -1) {
            addConversationIfMissing(m.conversationId);
            return prev;
          }
          const updated = { ...prev[idx]! };
          updated.lastAt = m.createdAt;
          if (m.content) {
            updated.lastMessage = m.content;
            updated.lastMessageType = "text";
          } else if (m.offerAmount != null) {
            updated.lastMessage = null;
            updated.lastMessageType = "offer";
          } else if (m.imageUrl) {
            updated.lastMessage = null;
            updated.lastMessageType = "image";
          } else if (m.latitude != null) {
            updated.lastMessage = null;
            updated.lastMessageType = "location";
          }
          if (m.senderId !== currentUserId) {
            updated.unread += 1;
          }
          const next = prev.filter((c) => c.id !== m.conversationId);
          return [updated, ...next];
        });
        break;
      }
      case "message_read": {
        if (!lastEvent.isRead || lastEvent.senderId === currentUserId) return;
        setConversations((prev) =>
          prev.map((c) => (c.id === lastEvent.conversationId ? { ...c, unread: 0 } : c)),
        );
        break;
      }
      case "listing_status": {
        setConversations((prev) =>
          prev.map((c) =>
            c.listingId === lastEvent.listingId ? { ...c, listingStatus: lastEvent.status } : c,
          ),
        );
        break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seq]);

  const filtered = conversations.filter((c) => {
    const q = query.toLowerCase();
    return (
      !q ||
      c.otherName.toLowerCase().includes(q) ||
      c.listingTitle.toLowerCase().includes(q) ||
      (c.lastMessage ?? "").toLowerCase().includes(q)
    );
  });

  function toggleSelectMode() {
    setSelectMode((prev) => !prev);
    setSelected(new Set());
  }

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleDeleteSelected() {
    if (selected.size === 0) return;
    if (!window.confirm(t("chat.deleteConfirm"))) return;
    const ids = Array.from(selected);
    logger.debug({ count: ids.length }, "[ConversationList] hiding conversations");
    setConversations((prev) => prev.filter((c) => !selected.has(c.id)));
    setSelected(new Set());
    setSelectMode(false);
    try {
      await fetch("/api/chat/conversations/hide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationIds: ids }),
      });
    } catch (err) {
      // best-effort — conversation stays hidden locally even if the request fails
      logger.warn({ count: ids.length, err }, "[ConversationList] hide conversations request failed");
    }
  }

  /** Human-readable preview of the last message, covering every message type. */
  function previewText(c: ConversationPreview): string {
    switch (c.lastMessageType) {
      case "text":
        return c.lastMessage ?? "";
      case "image":
        return t("chat.lastPhoto");
      case "location":
        return t("chat.lastLocation");
      case "offer":
        return t("chat.lastOffer");
      default:
        return t("chat.sayHello");
    }
  }

  return (
    <div>
      {/* Search bar + select toggle — only shown when there are conversations */}
      {conversations.length > 0 && (
        <div className="flex items-center gap-2 border-b border-border px-4 py-2">
          {conversations.length > 3 && (
            <div className="flex flex-1 items-center gap-2 rounded-md border border-border bg-surface-modal px-3">
              <Search size={15} className="shrink-0 text-text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("search.placeholder")}
                aria-label={t("chat.title")}
                className="h-9 w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
              />
            </div>
          )}
          {selectMode && selected.size > 0 ? (
            <button
              type="button"
              onClick={handleDeleteSelected}
              className="shrink-0 rounded-md bg-danger px-3 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              {t("chat.deleteSelected")} ({selected.size})
            </button>
          ) : (
            <button
              type="button"
              onClick={toggleSelectMode}
              className="shrink-0 rounded-md px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-modal"
            >
              {selectMode ? t("chat.cancel") : t("chat.select")}
            </button>
          )}
        </div>
      )}

      <ul className="divide-y divide-border">
        {filtered.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm text-text-secondary">
            {t("search.noResults")} &ldquo;{query}&rdquo;
          </li>
        ) : (
          filtered.map((c) => {
            const notActive = c.listingStatus !== "ACTIVE";
            const preview = previewText(c);
            const ariaLabel = [
              c.otherName,
              c.listingTitle,
              notActive ? t(STATUS_KEY[c.listingStatus] ?? c.listingStatus) : null,
              preview,
              c.unread > 0 ? `${c.unread} ${t("chat.unreadCount")}` : null,
            ]
              .filter(Boolean)
              .join(", ");
            const rowContent = (
              <>
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-surface-modal">
                  {c.listingImage ? (
                    <Image src={c.listingImage} alt="" fill className="object-cover" sizes="48px" />
                  ) : (
                    <span className="grid h-full w-full place-items-center" aria-hidden="true">📦</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium text-text-primary">{c.otherName}</p>
                    <span className="shrink-0 text-[11px] text-text-muted" suppressHydrationWarning>{timeAgo(c.lastAt)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-xs text-text-secondary">{c.listingTitle}</p>
                    {notActive && (
                      <Badge tone={STATUS_TONE[c.listingStatus] ?? "muted"} className="shrink-0 px-1.5 py-0 text-[10px]">
                        {t(STATUS_KEY[c.listingStatus] ?? c.listingStatus)}
                      </Badge>
                    )}
                  </div>
                  <p className={`truncate text-sm ${c.unread > 0 ? "font-medium text-text-primary" : "text-text-secondary"}`}>
                    {preview}
                  </p>
                </div>
                {c.unread > 0 && (
                  <span className="grid h-5 min-w-5 place-items-center rounded-pill bg-primary px-1.5 text-[11px] font-bold text-text-primary" aria-hidden="true">
                    {c.unread}
                  </span>
                )}
              </>
            );
            return (
              <li key={c.id}>
                {selectMode ? (
                  <label className="flex items-center gap-3 px-4 py-3 hover:bg-surface-card">
                    <input
                      type="checkbox"
                      checked={selected.has(c.id)}
                      onChange={() => toggleSelected(c.id)}
                      aria-label={ariaLabel}
                      className="size-4 shrink-0 accent-primary"
                    />
                    {rowContent}
                  </label>
                ) : (
                  <Link
                    href={`/chat/${c.id}`}
                    aria-label={ariaLabel}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-surface-card"
                  >
                    {rowContent}
                  </Link>
                )}
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
