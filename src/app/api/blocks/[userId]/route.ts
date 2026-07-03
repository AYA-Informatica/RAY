import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { ok, fail, handleApiError } from "@/lib/utils/api";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ userId: string }> };

/** GET /api/blocks/:userId — is the current user blocking :userId? */
export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const { userId } = await params;
    const user = await requireUser();
    const block = await prisma.block.findUnique({
      where: { blockerId_blockedId: { blockerId: user.id, blockedId: userId } },
      select: { id: true },
    });
    return ok({ blocked: Boolean(block) });
  } catch (err) {
    logger.error({ err }, "[GET block] ERROR");
    return handleApiError(err);
  }
}

/** POST /api/blocks/:userId — block a user (idempotent). */
export async function POST(_req: NextRequest, { params }: Ctx) {
  try {
    const { userId } = await params;
    const user = await requireUser();
    if (user.id === userId) return fail("You can't block yourself", 400);
    await prisma.block.upsert({
      where: { blockerId_blockedId: { blockerId: user.id, blockedId: userId } },
      update: {},
      create: { blockerId: user.id, blockedId: userId },
    });
    return ok({ blocked: true });
  } catch (err) {
    logger.error({ err }, "[POST block] ERROR");
    return handleApiError(err);
  }
}

/** DELETE /api/blocks/:userId — unblock. */
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const { userId } = await params;
    const user = await requireUser();
    await prisma.block.deleteMany({
      where: { blockerId: user.id, blockedId: userId },
    });
    return ok({ blocked: false });
  } catch (err) {
    logger.error({ err }, "[DELETE block] ERROR");
    return handleApiError(err);
  }
}
