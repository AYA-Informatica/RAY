import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth/session";
import { getUnreadCount } from "@/lib/chat/getUnreadCount";
import { ok, handleApiError } from "@/lib/utils/api";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * POST /api/presence — heartbeat. Updates the caller's lastSeenAt.
 * Uses getAuthUser (not getCurrentUser) to avoid an unnecessary Prisma
 * upsert — we only need the uid to stamp the timestamp. Guests and
 * expired sessions get a silent 200.
 */
export async function POST() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return ok({ ok: true });

    prisma.user.update({
      where: { id: authUser.id },
      data: { lastSeenAt: new Date() },
    }).catch(() => {});
    const unreadCount = await getUnreadCount(authUser.id);
    return ok({ ok: true, unreadCount });
  } catch (err) {
    logger.error({ err }, "[POST presence] ERROR");
    return handleApiError(err);
  }
}
