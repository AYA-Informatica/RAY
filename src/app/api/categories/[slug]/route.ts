import { NextRequest } from "next/server";
import { getCategoryWithAttributes } from "@/services/categories";
import { ok, fail, handleApiError } from "@/lib/utils/api";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ slug: string }> };

/** GET /api/categories/:slug — category + dynamic attribute schema (public). */
export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const { slug } = await params;
    logger.debug({ slug }, "[GET category] request received");
    const cat = await getCategoryWithAttributes(slug);
    if (!cat) {
      logger.warn({ slug }, "[GET category] rejected: not found");
      return fail("Category not found", 404);
    }
    logger.debug({ slug }, "[GET category] success");
    return ok(cat);
  } catch (err) {
    return handleApiError(err);
  }
}
