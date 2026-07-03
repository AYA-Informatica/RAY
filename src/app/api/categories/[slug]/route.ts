import { NextRequest } from "next/server";
import { getCategoryWithAttributes } from "@/services/categories";
import { ok, fail, handleApiError } from "@/lib/utils/api";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ slug: string }> };

/** GET /api/categories/:slug — category + dynamic attribute schema (public). */
export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const { slug } = await params;
    const cat = await getCategoryWithAttributes(slug);
    if (!cat) return fail("Category not found", 404);
    return ok(cat);
  } catch (err) {
    return handleApiError(err);
  }
}
