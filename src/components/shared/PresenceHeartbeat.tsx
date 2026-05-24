"use client";

import { usePresenceHeartbeat } from "@/hooks/usePresenceHeartbeat";

/** Mounts the presence heartbeat. Render once inside the app shell. */
export function PresenceHeartbeat() {
  usePresenceHeartbeat();
  return null;
}
