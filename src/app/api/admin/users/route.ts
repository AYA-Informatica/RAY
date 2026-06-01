import { requireUser } from "@/lib/auth/session";
import { requireStaff } from "@/lib/permissions/roles";
import { getManagedUsers } from "@/services/admin";
import { ok, handleApiError } from "@/lib/utils/api";

/** GET /api/admin/users — staff only. */
export async function GET() {
  try {
    const user = await requireUser();
    requireStaff(user);
    const users = await getManagedUsers();
    return ok(users);
  } catch (err) {
    return handleApiError(err);
  }
}
