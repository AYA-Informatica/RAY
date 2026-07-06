import { requireUser } from "@/lib/auth/session";
import { requireStaff } from "@/lib/permissions/roles";
import { ok, handleApiError } from "@/lib/utils/api";
import { getGeographicStats, getGrowthStats, getEngagementStats } from "@/services/admin";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    requireStaff(user);
    logger.debug({ userId: user.id }, "[GET admin/analytics] request received");
    const [geo, growth, engagement] = await Promise.all([
      getGeographicStats(),
      getGrowthStats(),
      getEngagementStats(),
    ]);
    logger.debug({ userId: user.id }, "[GET admin/analytics] success");
    return ok({ geo, growth, engagement });
  } catch (err) {
    return handleApiError(err);
  }
}
