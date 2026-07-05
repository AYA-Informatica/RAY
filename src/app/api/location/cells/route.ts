import { NextRequest } from "next/server";
import { ok, fail, handleApiError } from "@/lib/utils/api";
import { getRwandaCells } from "@/lib/location/rwanda";

export const dynamic = "force-dynamic";

/** GET /api/location/cells?district=Gasabo&sector=Remera — cells for a district+sector. */
export async function GET(req: NextRequest) {
  try {
    const district = req.nextUrl.searchParams.get("district");
    const sector = req.nextUrl.searchParams.get("sector");
    if (!district || !sector) return fail("district and sector query params are required", 400);
    const data = await getRwandaCells(district, sector);
    return ok(data, {
      headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
