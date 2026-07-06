"use client";

import { useEffect } from "react";
import { useUnreadMessages } from "@/store/useUnreadMessages";
import { logger } from "@/lib/logger";

/**
 * Pings /api/presence on mount and every 60s while the tab is visible,
 * so other users can see accurate online / last-seen status.
 * Stops itself if the server signals the session is gone (401/403).
 */
export function usePresenceHeartbeat() {
  useEffect(() => {
    let active = true;

    const beat = async () => {
      if (!active || document.visibilityState !== "visible") return;
      logger.debug({}, "[usePresenceHeartbeat] beat");
      try {
        const res = await fetch("/api/presence", { method: "POST" });
        if (!active) return;
        // Session gone — stop hammering the server.
        if (res.status === 401 || res.status === 403) {
          logger.debug({ status: res.status }, "[usePresenceHeartbeat] session gone, stopping");
          active = false;
          clearInterval(timer);
          document.removeEventListener("visibilitychange", handleVisibility);
          return;
        }
        const json = (await res.json()) as { data?: { unreadCount?: number } };
        if (typeof json.data?.unreadCount === "number") {
          useUnreadMessages.getState().setCount(json.data.unreadCount);
        }
      } catch {
        // Network error — fine, just skip this beat.
        logger.debug({}, "[usePresenceHeartbeat] beat failed, skipping");
      }
    };

    const handleVisibility = () => { void beat(); };

    void beat(); // immediate
    const timer = setInterval(() => { void beat(); }, 60_000);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      active = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);
}
