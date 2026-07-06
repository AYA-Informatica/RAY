import { requireUser } from "@/lib/auth/session";
import { requireStaff } from "@/lib/permissions/roles";
import { prisma } from "@/lib/prisma";
import { ok, handleApiError } from "@/lib/utils/api";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/** GET /api/admin/audit — last 100 admin actions, newest first. Staff only. */
export async function GET() {
  try {
    const user = await requireUser();
    requireStaff(user);
    logger.debug({ userId: user.id }, "[GET admin/audit] request received");
    const actions = await prisma.adminAction.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
      include: {
        admin: { select: { name: true, email: true, avatarUrl: true } },
      },
    });
    logger.debug({ count: actions.length }, "[GET admin/audit] success");
    return ok(actions);
  } catch (err) {
    return handleApiError(err);
  }
}
