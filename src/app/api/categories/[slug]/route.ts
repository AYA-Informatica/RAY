import { NextRequest } from "next/server";
import { getCategoryWithAttributes } from "@/services/categories";
import { ok, fail, handleApiError } from "@/lib/utils/api";

type Ctx = { params: { slug: string } };

/** GET /api/categories/:slug — category + dynamic attribute schema (public). */
export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const cat = await getCategoryWithAttributes(params.slug);
    if (!cat) return fail("Category not found", 404);
    return ok(cat);
  } catch (err) {
    return handleApiError(err);
  }
}
