import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { ok, handleApiError } from "@/lib/utils/api";

type Ctx = { params: { listingId: string } };

/** POST /api/favorites/:listingId — add (idempotent). */
export async function POST(_req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireUser();
    await prisma.favorite.upsert({
      where: { userId_listingId: { userId: user.id, listingId: params.listingId } },
      update: {},
      create: { userId: user.id, listingId: params.listingId },
    });
    return ok({ favorited: true });
  } catch (err) {
    return handleApiError(err);
  }
}

/** DELETE /api/favorites/:listingId — remove. */
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireUser();
    await prisma.favorite.deleteMany({
      where: { userId: user.id, listingId: params.listingId },
    });
    return ok({ favorited: false });
  } catch (err) {
    return handleApiError(err);
  }
}
