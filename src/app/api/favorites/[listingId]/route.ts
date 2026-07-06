import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { ok, fail, handleApiError } from "@/lib/utils/api";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ listingId: string }> };

/** POST /api/favorites/:listingId — add (idempotent). */
export async function POST(_req: NextRequest, { params }: Ctx) {
  try {
    const { listingId } = await params;
    const user = await requireUser();
    logger.debug({ userId: user.id, listingId }, "[POST favorite] request received");
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true },
    });
    if (!listing) {
      logger.warn({ userId: user.id, listingId }, "[POST favorite] rejected: listing not found");
      return fail("Listing not found", 404);
    }
    await prisma.favorite.upsert({
      where: { userId_listingId: { userId: user.id, listingId } },
      update: {},
      create: { userId: user.id, listingId },
    });
    logger.debug({ userId: user.id, listingId }, "[POST favorite] success");
    return ok({ favorited: true });
  } catch (err) {
    logger.error({ err }, "[POST favorite] ERROR");
    return handleApiError(err);
  }
}

/** DELETE /api/favorites/:listingId — remove. */
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const { listingId } = await params;
    const user = await requireUser();
    logger.debug({ userId: user.id, listingId }, "[DELETE favorite] request received");
    await prisma.favorite.deleteMany({
      where: { userId: user.id, listingId },
    });
    logger.debug({ userId: user.id, listingId }, "[DELETE favorite] success");
    return ok({ favorited: false });
  } catch (err) {
    logger.error({ err }, "[DELETE favorite] ERROR");
    return handleApiError(err);
  }
}
