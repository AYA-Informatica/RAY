"use client";

import { useEffect } from "react";

/**
 * Pings /api/presence on mount and every 60s while the tab is visible,
 * so other users can see accurate online / last-seen status.
 */
export function usePresenceHeartbeat() {
  useEffect(() => {
    const beat = () => {
      if (document.visibilityState === "visible") {
        void fetch("/api/presence", { method: "POST" }).catch(() => null);
      }
    };

    beat(); // immediate
    const timer = setInterval(beat, 60_000);
    document.addEventListener("visibilitychange", beat);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", beat);
    };
  }, []);
}
