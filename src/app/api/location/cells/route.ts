import { NextRequest } from "next/server";
import { ok, fail, handleApiError } from "@/lib/utils/api";
import { getRwandaCells } from "@/lib/location/rwanda";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/** GET /api/location/cells?district=Gasabo&sector=Remera — cells for a district+sector. */
export async function GET(req: NextRequest) {
  try {
    const district = req.nextUrl.searchParams.get("district");
    const sector = req.nextUrl.searchParams.get("sector");
    logger.debug({ district, sector }, "[GET location/cells] request received");
    if (!district || !sector) {
      logger.warn({ district, sector }, "[GET location/cells] rejected: district and sector required");
      return fail("district and sector query params are required", 400);
    }
    const data = await getRwandaCells(district, sector);
    logger.debug({ district, sector, count: data.length }, "[GET location/cells] success");
    return ok(data, {
      headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
