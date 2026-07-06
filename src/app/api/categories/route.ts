import { getCategories } from "@/services/categories";
import { ok, handleApiError } from "@/lib/utils/api";
import { logger } from "@/lib/logger";

/** GET /api/categories — all launch categories (public). */
export async function GET() {
  try {
    logger.debug({}, "[GET categories] request received");
    const categories = await getCategories();
    logger.debug({ count: categories.length }, "[GET categories] success");
    return ok(categories);
  } catch (err) {
    return handleApiError(err);
  }
}
