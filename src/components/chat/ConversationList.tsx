"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { timeAgo } from "@/lib/utils/format";
import { useI18n } from "@/i18n/I18nProvider";
import { Badge } from "@/components/ui/Badge";
import { STATUS_TONE, STATUS_KEY } from "@/lib/listings/status";

export interface ConversationPreview {
  id: string;
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

/** Inbox conversation list with client-side search. */
export function ConversationList({ conversations }: { conversations: ConversationPreview[] }) {
  const [query, setQuery] = useState("");
  const { t } = useI18n();

  const filtered = conversations.filter((c) => {
    const q = query.toLowerCase();
    return (
      !q ||
      c.otherName.toLowerCase().includes(q) ||
      c.listingTitle.toLowerCase().includes(q) ||
      (c.lastMessage ?? "").toLowerCase().includes(q)
    );
  });

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
      {/* Search bar — only shown when there are multiple conversations */}
      {conversations.length > 3 && (
        <div className="border-b border-border px-4 py-2">
          <div className="flex items-center gap-2 rounded-md border border-border bg-surface-modal px-3">
            <Search size={15} className="shrink-0 text-text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("search.placeholder")}
              aria-label={t("chat.title")}
              className="h-9 w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
            />
          </div>
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
            return (
              <li key={c.id}>
                <Link
                  href={`/chat/${c.id}`}
                  aria-label={ariaLabel}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-surface-card"
                >
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
                </Link>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
