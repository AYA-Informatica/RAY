import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { ok, handleApiError } from "@/lib/utils/api";

export const dynamic = "force-dynamic";

/** GET /api/favorites — the current user's favorited listing IDs (for hydration). */
export async function GET() {
  console.log("[GET favorites] start");
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.log("[GET favorites] no session — returning empty");
      return ok<string[]>([]);
    }
    const favs = await prisma.favorite.findMany({
      where: { userId: user.id },
      select: { listingId: true },
    });
    console.log("[GET favorites] returning", favs.length, "favorites for uid=", user.id);
    return ok(favs.map((f) => f.listingId));
  } catch (err) {
    console.error("[GET favorites] ERROR:", err instanceof Error ? err.message : err);
    return handleApiError(err);
  }
}
