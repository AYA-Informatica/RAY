import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { ok, handleApiError } from "@/lib/utils/api";

/** GET /api/favorites — the current user's favorited listing IDs (for hydration). */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return ok<string[]>([]);
    const favs = await prisma.favorite.findMany({
      where: { userId: user.id },
      select: { listingId: true },
    });
    return ok(favs.map((f) => f.listingId));
  } catch (err) {
    return handleApiError(err);
  }
}
