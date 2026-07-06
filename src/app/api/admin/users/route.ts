import { requireUser } from "@/lib/auth/session";
import { requireStaff } from "@/lib/permissions/roles";
import { getManagedUsers } from "@/services/admin";
import { ok, handleApiError } from "@/lib/utils/api";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/** GET /api/admin/users — staff only. */
export async function GET() {
  try {
    const user = await requireUser();
    requireStaff(user);
    logger.debug({ userId: user.id }, "[GET admin/users] request received");
    const users = await getManagedUsers();
    logger.debug({ count: users.length }, "[GET admin/users] success");
    return ok(users);
  } catch (err) {
    return handleApiError(err);
  }
}
