import { requireUser } from "@/lib/auth/session";
import { requireStaff } from "@/lib/permissions/roles";
import { getModerationListings } from "@/services/admin";
import { ok, handleApiError } from "@/lib/utils/api";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/** GET /api/admin/listings — staff only. Used by the client-side admin listings page. */
export async function GET() {
  try {
    const user = await requireUser();
    requireStaff(user);
    logger.debug({ userId: user.id }, "[GET admin/listings] request received");
    const listings = await getModerationListings();
    logger.debug({ count: listings.length }, "[GET admin/listings] success");
    return ok(listings);
  } catch (err) {
    return handleApiError(err);
  }
}
