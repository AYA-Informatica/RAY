import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { createReportSchema } from "@/lib/validations/report.schema";
import { sanitizeText } from "@/lib/sanitization/sanitize";
import { ok, handleApiError, RATE_LIMITED } from "@/lib/utils/api";
import { limiters, checkLimit } from "@/lib/ratelimit";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * POST /api/reports — file a report. Per spec: increases moderation visibility
 * but does NOT auto-remove the listing. Auto-flag heuristic bumps status only
 * after a threshold of distinct reports.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    if (!(await checkLimit(limiters.report, user.id))) {
      logger.warn({ userId: user.id }, "[POST report] rejected: rate limited");
      return RATE_LIMITED();
    }

    const data = createReportSchema.parse(await req.json());
    logger.debug(
      { userId: user.id, listingId: data.listingId, reason: data.reason },
      "[POST report] request received",
    );

    await prisma.report.create({
      data: {
        reason: data.reason,
        details: data.details ? sanitizeText(data.details) : null,
        reporterId: user.id,
        listingId: data.listingId ?? null,
      },
    });

    if (data.listingId) {
      const count = await prisma.report.count({ where: { listingId: data.listingId, resolved: false } });
      if (count >= 3) {
        await prisma.listing.update({ where: { id: data.listingId }, data: { status: "FLAGGED" } });
        logger.warn({ listingId: data.listingId, count }, "Listing auto-flagged");
      }
    }

    logger.debug({ userId: user.id, listingId: data.listingId }, "[POST report] success");
    return ok({ received: true }, { status: 201 });
  } catch (err) {
    logger.error({ err }, "[POST report] ERROR");
    return handleApiError(err);
  }
}
