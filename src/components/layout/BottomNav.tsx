"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusCircle, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * Persistent bottom navigation — matches the wireframe:
 * Home · Search · Sell (center, ringed) · Message · Profile
 */
type NavItem = {
  href: string;
  labelKey: string;
  icon: typeof Home;
  center?: boolean;
};

const ITEMS: readonly NavItem[] = [
  { href: "/home", labelKey: "nav.home", icon: Home },
  { href: "/search", labelKey: "nav.search", icon: Search },
  { href: "/sell", labelKey: "nav.sell", icon: PlusCircle, center: true },
  { href: "/chat", labelKey: "nav.messages", icon: MessageCircle },
  { href: "/profile", labelKey: "nav.profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-primary">
      <ul className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {ITEMS.map(({ href, labelKey, icon: Icon, center }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <li key={href}>
              <Link
                href={href}
                className="flex flex-col items-center gap-0.5 px-2 text-text-primary"
                aria-current={active ? "page" : undefined}
              >
                <span
                  className={cn(
                    "flex items-center justify-center",
                    center && "rounded-pill ring-2 ring-text-primary p-0.5",
                  )}
                >
                  <Icon size={center ? 24 : 22} strokeWidth={active ? 2.6 : 2} />
                </span>
                <span className={cn("text-[10px]", active ? "font-bold" : "font-medium opacity-90")}>
                  {t(labelKey)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
