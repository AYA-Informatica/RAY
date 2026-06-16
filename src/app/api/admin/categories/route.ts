import { requireUser } from "@/lib/auth/session";
import { requireStaff } from "@/lib/permissions/roles";
import { getCategoryHealth } from "@/services/admin";
import { ok, handleApiError } from "@/lib/utils/api";

export const dynamic = "force-dynamic";

/** GET /api/admin/categories — category health stats. Staff only. */
export async function GET() {
  try {
    const user = await requireUser();
    requireStaff(user);
    const data = await getCategoryHealth();
    return ok(data);
  } catch (err) {
    return handleApiError(err);
  }
}
