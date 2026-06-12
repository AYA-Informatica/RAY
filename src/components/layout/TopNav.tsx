"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, MessageCircle, User, Plus, Heart } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/i18n/I18nProvider";
import { useUnreadMessages } from "@/store/useUnreadMessages";

/**
 * Desktop / laptop top navigation. Hidden below `lg`, where the mobile
 * BottomNav takes over. Mirrors the same destinations as the bottom bar so
 * the experience is consistent across breakpoints.
 */
const LINKS = [
  { href: "/home", labelKey: "nav.home", icon: Home },
  { href: "/search", labelKey: "nav.search", icon: Search },
  { href: "/chat", labelKey: "nav.messages", icon: MessageCircle },
] as const;

export function TopNav({ unreadMessages = 0 }: { unreadMessages?: number }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const liveUnread = useUnreadMessages((s) => s.count);
  const unread = liveUnread ?? unreadMessages;

  return (
    <header className="sticky top-0 z-50 hidden border-b border-border bg-background/90 backdrop-blur mouse-lg:block">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-8">
        <Link href="/home" className="font-display text-2xl font-extrabold tracking-tight text-primary">
          RAY
        </Link>

        <nav className="flex items-center gap-1">
          {LINKS.map(({ href, labelKey, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            const badge = href === "/chat" && unread > 0 ? unread : 0;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-surface-card text-text-primary" : "text-text-secondary hover:text-text-primary",
                )}
              >
                <Icon size={18} strokeWidth={active ? 2.4 : 2} />
                {t(labelKey)}
                {badge > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-pill bg-danger px-1 text-[9px] font-bold text-white">
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/sell"
            className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-text-primary transition-colors hover:bg-primary-dark"
          >
            <Plus size={18} /> {t("nav.sell")}
          </Link>
          <Link
            href="/favorites"
            aria-label="Favourites"
            className="grid h-9 w-9 place-items-center rounded-pill text-text-secondary transition-colors hover:bg-surface-card hover:text-text-primary"
          >
            <Heart size={20} />
          </Link>
          <Link
            href="/profile"
            aria-label={t("nav.profile")}
            className="grid h-9 w-9 place-items-center rounded-pill bg-surface-card text-text-secondary transition-colors hover:text-text-primary"
          >
            <User size={18} />
          </Link>
        </div>
      </div>
    </header>
  );
}
