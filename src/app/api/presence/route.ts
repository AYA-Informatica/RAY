import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { ok, handleApiError } from "@/lib/utils/api";

/**
 * POST /api/presence — heartbeat. Updates the caller's lastSeenAt.
 * Called periodically by the app while active so other users can see
 * "online" / "last seen". Cheap, single-row update.
 * Non-critical - always returns success even if update fails.
 */
export async function POST() {
  try {
    const user = await requireUser();
    // Fire-and-forget update - presence is non-critical
    prisma.user.update({
      where: { id: user.id },
      data: { lastSeenAt: new Date() },
    }).catch(() => {});
    return ok({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
