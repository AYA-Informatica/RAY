import { getCategories } from "@/services/categories";
import { ok, handleApiError } from "@/lib/utils/api";

/** GET /api/categories — all launch categories (public). */
export async function GET() {
  try {
    return ok(await getCategories());
  } catch (err) {
    return handleApiError(err);
  }
}
