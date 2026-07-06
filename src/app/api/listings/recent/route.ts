import { NextRequest } from "next/server";
import { ok, fail, handleApiError } from "@/lib/utils/api";
import { getRankedRecentListings } from "@/services/listings";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const HOME_FEED_SIZE = 15;

/** GET /api/listings/recent?lat=&lng= — home feed re-ranked by recency + proximity. */
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const latParam = sp.get("lat");
    const lngParam = sp.get("lng");
    logger.debug({ lat: latParam, lng: lngParam }, "[GET listings/recent] request received");

    let origin: { lat: number; lng: number } | undefined;
    if (latParam != null && lngParam != null) {
      const lat = Number(latParam);
      const lng = Number(lngParam);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        logger.warn({ lat: latParam, lng: lngParam }, "[GET listings/recent] rejected: invalid coordinates");
        return fail("Invalid coordinates", 400);
      }
      origin = { lat, lng };
    }

    const items = await getRankedRecentListings({ origin }, HOME_FEED_SIZE);
    logger.debug({ count: items.length }, "[GET listings/recent] success");
    return ok({ items });
  } catch (err) {
    return handleApiError(err);
  }
}
