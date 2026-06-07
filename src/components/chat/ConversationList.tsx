"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { timeAgo } from "@/lib/utils/format";
import { useI18n } from "@/i18n/I18nProvider";

export interface ConversationPreview {
  id: string;
  listingTitle: string;
  listingImage: string | null;
  otherName: string;
  otherAvatar: string | null;
  lastMessage: string | null;
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
          filtered.map((c) => (
            <li key={c.id}>
              <Link href={`/chat/${c.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-card">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-surface-modal">
                  {c.listingImage ? (
                    <Image src={c.listingImage} alt={c.listingTitle} fill className="object-cover" sizes="48px" />
                  ) : (
                    <span className="grid h-full w-full place-items-center">📦</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`truncate font-medium ${c.unread > 0 ? "text-text-primary" : "text-text-primary"}`}>
                      {c.otherName}
                    </p>
                    <span className="shrink-0 text-[11px] text-text-muted" suppressHydrationWarning>{timeAgo(c.lastAt)}</span>
                  </div>
                  <p className="truncate text-xs text-text-secondary">{c.listingTitle}</p>
                  <p className={`truncate text-sm ${c.unread > 0 ? "font-medium text-text-primary" : "text-text-secondary"}`}>
                    {c.lastMessage ?? t("chat.sayHello")}
                  </p>
                </div>
                {c.unread > 0 && (
                  <span className="grid h-5 min-w-5 place-items-center rounded-pill bg-primary px-1.5 text-[11px] font-bold text-text-primary">
                    {c.unread}
                  </span>
                )}
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
