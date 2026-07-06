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
    logger.debug({ userId: user.id, targetId: userId }, "[GET block] request received");
    const block = await prisma.block.findUnique({
      where: { blockerId_blockedId: { blockerId: user.id, blockedId: userId } },
      select: { id: true },
    });
    logger.debug({ userId: user.id, targetId: userId, blocked: Boolean(block) }, "[GET block] success");
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
    logger.debug({ userId: user.id, targetId: userId }, "[POST block] request received");
    if (user.id === userId) {
      logger.warn({ userId: user.id }, "[POST block] rejected: cannot block self");
      return fail("You can't block yourself", 400);
    }
    await prisma.block.upsert({
      where: { blockerId_blockedId: { blockerId: user.id, blockedId: userId } },
      update: {},
      create: { blockerId: user.id, blockedId: userId },
    });
    logger.info({ userId: user.id, targetId: userId }, "[POST block] success");
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
    logger.debug({ userId: user.id, targetId: userId }, "[DELETE block] request received");
    await prisma.block.deleteMany({
      where: { blockerId: user.id, blockedId: userId },
    });
    logger.info({ userId: user.id, targetId: userId }, "[DELETE block] success");
    return ok({ blocked: false });
  } catch (err) {
    logger.error({ err }, "[DELETE block] ERROR");
    return handleApiError(err);
  }
}
