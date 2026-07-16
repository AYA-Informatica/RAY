import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { pushTokenSchema } from "@/lib/validations/pushToken.schema";
import { ok, handleApiError } from "@/lib/utils/api";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/** POST /api/push-token — register the caller's Expo push token.
 *  Called by the mobile app once after sign-in. Idempotent — safe to call
 *  repeatedly; last write wins (one token per user, no multi-device table yet). */
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const { token } = pushTokenSchema.parse(await req.json());
    await prisma.user.update({
      where: { id: user.id },
      data: { pushToken: token },
      select: { id: true },
    });
    logger.debug({ userId: user.id }, "[POST push-token] saved");
    return ok({ saved: true });
  } catch (err) {
    logger.error({ err }, "[POST push-token] ERROR");
    return handleApiError(err);
  }
}
