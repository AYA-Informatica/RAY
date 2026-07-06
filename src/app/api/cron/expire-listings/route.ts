import { timingSafeEqual } from "node:crypto";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail, handleApiError } from "@/lib/utils/api";
import { logger } from "@/lib/logger";

/**
 * GET /api/cron/expire-listings
 *
 * Scheduled by Vercel Cron (see vercel.json). Flips ACTIVE listings whose
 * `expiresAt` has passed to EXPIRED, so the 30-day lifecycle is actually
 * enforced (nothing else mutates status on a timer).
 *
 * Secured by the CRON_SECRET shared secret. Vercel Cron automatically sends
 * `Authorization: Bearer <CRON_SECRET>` when the env var is set, so external
 * callers without the secret are rejected.
 */
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const secret = process.env.CRON_SECRET;
    if (secret) {
      const provided = req.headers.get("authorization")?.replace("Bearer ", "") ?? "";
      const safe =
        provided.length === secret.length &&
        timingSafeEqual(Buffer.from(provided), Buffer.from(secret));
      if (!safe) {
        logger.warn("Rejected unauthorized cron request to expire-listings");
        return fail("Unauthorized", 401);
      }
    }

    logger.debug({}, "[CRON expire-listings] request received");
    const result = await prisma.listing.updateMany({
      where: { status: "ACTIVE", expiresAt: { lt: new Date() } },
      data: { status: "EXPIRED" },
    });

    logger.info({ expired: result.count }, "Listing expiry sweep complete");
    return ok({ expired: result.count, ranAt: new Date().toISOString() });
  } catch (err) {
    logger.error({ err }, "[CRON expire-listings] ERROR");
    return handleApiError(err);
  }
}
