import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { ok, handleApiError } from "@/lib/utils/api";

export const dynamic = "force-dynamic";

/**
 * POST /api/presence — heartbeat. Updates the caller's lastSeenAt.
 * Called periodically by the app while active so other users can see
 * "online" / "last seen". Cheap, single-row update.
 * Uses getCurrentUser (not requireUser) so guests and expired sessions
 * get a silent 200 instead of a 401 — presence is non-critical.
 */
export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      // Guest or expired session — no-op, no error noise.
      return ok({ ok: true });
    }
    console.log("[POST presence] heartbeat uid=", user.id);
    prisma.user.update({
      where: { id: user.id },
      data: { lastSeenAt: new Date() },
    }).catch((err) => {
      console.error("[POST presence] lastSeenAt update failed uid=", user.id, err instanceof Error ? err.message : err);
    });
    return ok({ ok: true });
  } catch (err) {
    console.error("[POST presence] ERROR:", err instanceof Error ? err.message : err);
    return handleApiError(err);
  }
}
