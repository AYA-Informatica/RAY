import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { ok, handleApiError } from "@/lib/utils/api";

/**
 * POST /api/presence — heartbeat. Updates the caller's lastSeenAt.
 * Called periodically by the app while active so other users can see
 * "online" / "last seen". Cheap, single-row update.
 */
export async function POST() {
  try {
    const user = await requireUser();
    await prisma.user.update({
      where: { id: user.id },
      data: { lastSeenAt: new Date() },
    });
    return ok({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
