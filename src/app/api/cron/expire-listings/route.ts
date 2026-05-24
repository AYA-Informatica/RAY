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
    // If a secret is configured, require it. (In dev with no secret, allow.)
    if (secret) {
      const auth = req.headers.get("authorization");
      if (auth !== `Bearer ${secret}`) {
        logger.warn("Rejected unauthorized cron request to expire-listings");
        return fail("Unauthorized", 401);
      }
    }

    const result = await prisma.listing.updateMany({
      where: { status: "ACTIVE", expiresAt: { lt: new Date() } },
      data: { status: "EXPIRED" },
    });

    logger.info({ expired: result.count }, "Listing expiry sweep complete");
    return ok({ expired: result.count, ranAt: new Date().toISOString() });
  } catch (err) {
    return handleApiError(err);
  }
}
