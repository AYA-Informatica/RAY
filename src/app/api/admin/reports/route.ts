import { requireUser } from "@/lib/auth/session";
import { requireStaff } from "@/lib/permissions/roles";
import { getOpenReports } from "@/services/admin";
import { ok, handleApiError } from "@/lib/utils/api";

/** GET /api/admin/reports — staff only. */
export async function GET() {
  try {
    const user = await requireUser();
    requireStaff(user);
    const reports = await getOpenReports();
    return ok(reports);
  } catch (err) {
    return handleApiError(err);
  }
}
