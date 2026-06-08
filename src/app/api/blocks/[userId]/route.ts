import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { ok, fail, handleApiError } from "@/lib/utils/api";

export const dynamic = "force-dynamic";

type Ctx = { params: { userId: string } };

/** GET /api/blocks/:userId — is the current user blocking :userId? */
export async function GET(_req: NextRequest, { params }: Ctx) {
  console.log("[GET block] target=", params.userId);
  try {
    const user = await requireUser();
    const block = await prisma.block.findUnique({
      where: { blockerId_blockedId: { blockerId: user.id, blockedId: params.userId } },
      select: { id: true },
    });
    console.log("[GET block] uid=", user.id, "blocked=", Boolean(block));
    return ok({ blocked: Boolean(block) });
  } catch (err) {
    console.error("[GET block] ERROR:", err instanceof Error ? err.message : err);
    return handleApiError(err);
  }
}

/** POST /api/blocks/:userId — block a user (idempotent). */
export async function POST(_req: NextRequest, { params }: Ctx) {
  console.log("[POST block] target=", params.userId);
  try {
    const user = await requireUser();
    if (user.id === params.userId) return fail("You can't block yourself", 400);
    await prisma.block.upsert({
      where: { blockerId_blockedId: { blockerId: user.id, blockedId: params.userId } },
      update: {},
      create: { blockerId: user.id, blockedId: params.userId },
    });
    console.log("[POST block] blocked OK uid=", user.id, "target=", params.userId);
    return ok({ blocked: true });
  } catch (err) {
    console.error("[POST block] ERROR:", err instanceof Error ? err.message : err);
    return handleApiError(err);
  }
}

/** DELETE /api/blocks/:userId — unblock. */
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  console.log("[DELETE block] target=", params.userId);
  try {
    const user = await requireUser();
    await prisma.block.deleteMany({
      where: { blockerId: user.id, blockedId: params.userId },
    });
    console.log("[DELETE block] unblocked OK uid=", user.id, "target=", params.userId);
    return ok({ blocked: false });
  } catch (err) {
    console.error("[DELETE block] ERROR:", err instanceof Error ? err.message : err);
    return handleApiError(err);
  }
}
