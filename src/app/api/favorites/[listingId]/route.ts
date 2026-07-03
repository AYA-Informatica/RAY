import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { ok, fail, handleApiError } from "@/lib/utils/api";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ listingId: string }> };

/** POST /api/favorites/:listingId — add (idempotent). */
export async function POST(_req: NextRequest, { params }: Ctx) {
  try {
    const { listingId } = await params;
    const user = await requireUser();
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true },
    });
    if (!listing) return fail("Listing not found", 404);
    await prisma.favorite.upsert({
      where: { userId_listingId: { userId: user.id, listingId } },
      update: {},
      create: { userId: user.id, listingId },
    });
    return ok({ favorited: true });
  } catch (err) {
    console.error("[POST favorite] ERROR:", err instanceof Error ? err.message : err);
    return handleApiError(err);
  }
}

/** DELETE /api/favorites/:listingId — remove. */
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const { listingId } = await params;
    const user = await requireUser();
    await prisma.favorite.deleteMany({
      where: { userId: user.id, listingId },
    });
    return ok({ favorited: false });
  } catch (err) {
    console.error("[DELETE favorite] ERROR:", err instanceof Error ? err.message : err);
    return handleApiError(err);
  }
}
