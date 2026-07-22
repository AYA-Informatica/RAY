"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, MessageCircle, Heart, Tag, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { timeAgo } from "@/lib/utils/format";
import { logger } from "@/lib/logger";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

const TYPE_ICON: Record<string, React.ElementType> = {
  message: MessageCircle,
  offer: Tag,
  favorite: Heart,
};

export function NotificationBell({ initialUnread = 0 }: { initialUnread?: number }) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(initialUnread);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loaded, setLoaded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  async function load() {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const json = (await res.json()) as { data?: Notification[] };
      const items = json.data ?? [];
      setNotifications(items);
      setUnread(items.filter((n) => !n.isRead).length);
      setLoaded(true);
    } catch (err) {
      logger.warn({ err }, "[NotificationBell] load failed");
    }
  }

  async function markRead() {
    if (unread === 0) return;
    setUnread(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await fetch("/api/notifications", { method: "POST" });
    } catch (err) {
      logger.warn({ err }, "[NotificationBell] mark-read failed");
    }
  }

  const handleOpen = useCallback(async () => {
    setOpen((o) => !o);
    if (!open) {
      if (!loaded) await load();
      await markRead();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, loaded]);

  // Poll for new notifications every 60 s while mounted.
  useEffect(() => {
    const id = setInterval(async () => {
      if (open) return;
      try {
        const res = await fetch("/api/notifications");
        if (!res.ok) return;
        const json = (await res.json()) as { data?: Notification[] };
        const items = json.data ?? [];
        setUnread(items.filter((n) => !n.isRead).length);
        if (open) setNotifications(items);
      } catch {}
    }, 60_000);
    return () => clearInterval(id);
  }, [open]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={handleOpen}
        aria-label="Notifications"
        className="relative grid h-9 w-9 place-items-center rounded-pill text-text-secondary transition-colors hover:bg-surface-card hover:text-text-primary"
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-pill bg-danger px-1 text-[9px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-xl border border-border bg-background shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="font-display font-bold text-text-primary">Notifications</h3>
            <button onClick={() => setOpen(false)} className="text-text-muted hover:text-text-primary">
              <X size={16} />
            </button>
          </div>
          <ul className="max-h-96 divide-y divide-border overflow-y-auto">
            {notifications.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-text-muted">No notifications yet</li>
            ) : (
              notifications.map((n) => {
                const Icon = TYPE_ICON[n.type] ?? Bell;
                const inner = (
                  <div className={cn("flex gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-card", !n.isRead && "bg-primary/5")}>
                    <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-pill bg-surface-modal text-text-secondary">
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-sm", !n.isRead && "font-semibold text-text-primary")}>{n.title}</p>
                      {n.body && <p className="truncate text-xs text-text-secondary">{n.body}</p>}
                      <p className="mt-0.5 text-[10px] text-text-muted" suppressHydrationWarning>{timeAgo(new Date(n.createdAt))}</p>
                    </div>
                    {!n.isRead && <span className="mt-2 h-2 w-2 shrink-0 rounded-pill bg-primary" />}
                  </div>
                );
                return (
                  <li key={n.id}>
                    {n.link ? (
                      <Link href={n.link} onClick={() => setOpen(false)}>{inner}</Link>
                    ) : (
                      inner
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
