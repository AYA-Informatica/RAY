import { NextRequest } from "next/server";
import { searchQuerySchema } from "@/lib/validations/search.schema";
import { searchListings } from "@/services/listings";
import { ok, handleApiError, RATE_LIMITED } from "@/lib/utils/api";
import { limiters, checkLimit } from "@/lib/ratelimit";

/** GET /api/search — filtered, location-ranked search (public). */
export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "anon";
    if (!(await checkLimit(limiters.search, ip))) return RATE_LIMITED();

    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    const query = searchQuerySchema.parse(params);
    const result = await searchListings(query);
    return ok(result);
  } catch (err) {
    return handleApiError(err);
  }
}
