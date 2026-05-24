import Link from "next/link";
import Image from "next/image";
import { timeAgo } from "@/lib/utils/format";

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

/** Inbox list (Messages tab). */
export function ConversationList({ conversations }: { conversations: ConversationPreview[] }) {
  return (
    <ul className="divide-y divide-border">
      {conversations.map((c) => (
        <li key={c.id}>
          <Link href={`/chat/${c.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-card">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-surface-modal">
              {c.listingImage ? (
                <Image src={c.listingImage} alt={c.listingTitle} fill className="object-cover" />
              ) : (
                <span className="grid h-full w-full place-items-center">📦</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate font-medium text-text-primary">{c.otherName}</p>
                <span className="shrink-0 text-[11px] text-text-muted">{timeAgo(c.lastAt)}</span>
              </div>
              <p className="truncate text-xs text-text-secondary">{c.listingTitle}</p>
              <p className="truncate text-sm text-text-secondary">{c.lastMessage ?? "Start the conversation"}</p>
            </div>
            {c.unread > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-pill bg-primary px-1.5 text-[11px] font-bold text-text-primary">
                {c.unread}
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
