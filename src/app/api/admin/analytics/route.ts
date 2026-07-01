import { requireUser } from "@/lib/auth/session";
import { requireStaff } from "@/lib/permissions/roles";
import { ok, handleApiError } from "@/lib/utils/api";
import { getGeographicStats, getGrowthStats, getEngagementStats } from "@/services/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    requireStaff(user);
    const [geo, growth, engagement] = await Promise.all([
      getGeographicStats(),
      getGrowthStats(),
      getEngagementStats(),
    ]);
    return ok({ geo, growth, engagement });
  } catch (err) {
    return handleApiError(err);
  }
}
