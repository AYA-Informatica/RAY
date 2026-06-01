import { getAuthUser } from "@/lib/auth/session";
import { PresenceHeartbeatClient } from "./PresenceHeartbeatClient";

/** Renders the heartbeat only when a session exists — avoids 401 noise for guests. */
export async function PresenceHeartbeat() {
  const user = await getAuthUser();
  if (!user) return null;
  return <PresenceHeartbeatClient />;
}
