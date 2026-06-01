import { requireUser } from "@/lib/auth/session";
import { requireStaff } from "@/lib/permissions/roles";
import { getModerationListings } from "@/services/admin";
import { ok, handleApiError } from "@/lib/utils/api";

/** GET /api/admin/listings — staff only. Used by the client-side admin listings page. */
export async function GET() {
  try {
    const user = await requireUser();
    requireStaff(user);
    const listings = await getModerationListings();
    return ok(listings);
  } catch (err) {
    return handleApiError(err);
  }
}
