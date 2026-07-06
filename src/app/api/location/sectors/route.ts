import { NextRequest } from "next/server";
import { ok, fail, handleApiError } from "@/lib/utils/api";
import { getRwandaSectors } from "@/lib/location/rwanda";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/** GET /api/location/sectors?district=Gasabo — sectors for a district. */
export async function GET(req: NextRequest) {
  try {
    const district = req.nextUrl.searchParams.get("district");
    logger.debug({ district }, "[GET location/sectors] request received");
    if (!district) {
      logger.warn({}, "[GET location/sectors] rejected: district required");
      return fail("district query param is required", 400);
    }
    const data = await getRwandaSectors(district);
    logger.debug({ district, count: data.length }, "[GET location/sectors] success");
    return ok(data, {
      headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
