"use client";

import { useEffect } from "react";

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
      try {
        const res = await fetch("/api/presence", { method: "POST" });
        if (!active) return;
        // Session gone — stop hammering the server.
        if (res.status === 401 || res.status === 403) {
          active = false;
          clearInterval(timer);
          document.removeEventListener("visibilitychange", handleVisibility);
        }
      } catch {
        // Network error — fine, just skip this beat.
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
