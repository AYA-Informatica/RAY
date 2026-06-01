"use client";

import { usePresenceHeartbeat } from "@/hooks/usePresenceHeartbeat";

/** Pure client wrapper — only mounted by PresenceHeartbeat when authed. */
export function PresenceHeartbeatClient() {
  usePresenceHeartbeat();
  return null;
}
