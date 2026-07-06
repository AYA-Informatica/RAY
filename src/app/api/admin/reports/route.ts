import { requireUser } from "@/lib/auth/session";
import { requireStaff } from "@/lib/permissions/roles";
import { getOpenReports } from "@/services/admin";
import { ok, handleApiError } from "@/lib/utils/api";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/** GET /api/admin/reports — staff only. */
export async function GET() {
  try {
    const user = await requireUser();
    requireStaff(user);
    logger.debug({ userId: user.id }, "[GET admin/reports] request received");
    const reports = await getOpenReports();
    logger.debug({ count: reports.length }, "[GET admin/reports] success");
    return ok(reports);
  } catch (err) {
    return handleApiError(err);
  }
}
