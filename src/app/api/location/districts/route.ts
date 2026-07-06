import { ok, handleApiError } from "@/lib/utils/api";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/** GET /api/location/districts — all 30 Rwanda districts with their province. */
export async function GET() {
  try {
    logger.debug({}, "[GET location/districts] request received");
    const rows = await prisma.rwandaLocation.findMany({
      select: { district: true, province: true },
      distinct: ["district"],
      orderBy: { district: "asc" },
    });
    logger.debug({ count: rows.length }, "[GET location/districts] success");
    return ok(rows, {
      headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
