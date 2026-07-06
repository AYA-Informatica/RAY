import { requireUser } from "@/lib/auth/session";
import { requireStaff } from "@/lib/permissions/roles";
import { getCategoryHealth } from "@/services/admin";
import { ok, handleApiError } from "@/lib/utils/api";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/** GET /api/admin/categories — category health stats. Staff only. */
export async function GET() {
  try {
    const user = await requireUser();
    requireStaff(user);
    logger.debug({ userId: user.id }, "[GET admin/categories] request received");
    const data = await getCategoryHealth();
    logger.debug({ count: Array.isArray(data) ? data.length : undefined }, "[GET admin/categories] success");
    return ok(data);
  } catch (err) {
    return handleApiError(err);
  }
}
