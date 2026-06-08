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
  console.log("[POST report] start");
  try {
    const user = await requireUser();
    if (!(await checkLimit(limiters.report, user.id))) {
      console.warn("[POST report] rate limited uid=", user.id);
      return RATE_LIMITED();
    }

    const data = createReportSchema.parse(await req.json());
    console.log("[POST report] uid=", user.id, "reason=", data.reason, "listingId=", data.listingId ?? "none");

    await prisma.report.create({
      data: {
        reason: data.reason,
        details: data.details ? sanitizeText(data.details) : null,
        reporterId: user.id,
        listingId: data.listingId ?? null,
      },
    });
    console.log("[POST report] report created OK");

    // Reactive auto-flag: 3+ reports flips status to FLAGGED for moderators.
    if (data.listingId) {
      const count = await prisma.report.count({ where: { listingId: data.listingId, resolved: false } });
      console.log("[POST report] unresolved report count for listing=", count);
      if (count >= 3) {
        await prisma.listing.update({ where: { id: data.listingId }, data: { status: "FLAGGED" } });
        console.warn("[POST report] listing auto-flagged listingId=", data.listingId, "reportCount=", count);
        logger.warn({ listingId: data.listingId, count }, "Listing auto-flagged");
      }
    }

    return ok({ received: true }, { status: 201 });
  } catch (err) {
    console.error("[POST report] ERROR:", err instanceof Error ? err.message : err);
    return handleApiError(err);
  }
}
