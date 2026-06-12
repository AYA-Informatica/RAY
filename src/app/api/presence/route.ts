import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth/session";
import { getUnreadCount } from "@/lib/chat/getUnreadCount";
import { ok, handleApiError } from "@/lib/utils/api";

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

    console.log("[POST presence] heartbeat uid=", authUser.id);
    prisma.user.update({
      where: { id: authUser.id },
      data: { lastSeenAt: new Date() },
    }).catch((err) => {
      console.error("[POST presence] lastSeenAt update failed uid=", authUser.id, err instanceof Error ? err.message : err);
    });
    const unreadCount = await getUnreadCount(authUser.id);
    return ok({ ok: true, unreadCount });
  } catch (err) {
    console.error("[POST presence] ERROR:", err instanceof Error ? err.message : err);
    return handleApiError(err);
  }
}
