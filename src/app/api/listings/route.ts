import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { createListingSchema } from "@/lib/validations/listing.schema";
import { sanitizeText } from "@/lib/sanitization/sanitize";
import { ok, fail, handleApiError, RATE_LIMITED } from "@/lib/utils/api";
import { limiters, checkLimit } from "@/lib/ratelimit";
import { getRecentListings } from "@/services/listings";

/** GET /api/listings — recent active listings (public). */
export async function GET() {
  try {
    const items = await getRecentListings(20);
    return ok(items);
  } catch (err) {
    return handleApiError(err);
  }
}

/** POST /api/listings — create a listing (auth + Zod + sanitize + rate limit). */
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();

    if (!(await checkLimit(limiters.listingCreate, user.id))) return RATE_LIMITED();

    const body = await req.json();
    const data = createListingSchema.parse(body);

    if (data.images.length > 7) return fail("Maximum 7 photos", 422);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30-day lifecycle

    const listing = await prisma.listing.create({
      data: {
        title: sanitizeText(data.title),
        description: sanitizeText(data.description),
        price: data.price,
        negotiable: data.negotiable,
        condition: data.condition,
        categoryId: data.categoryId,
        city: sanitizeText(data.city),
        district: sanitizeText(data.district),
        neighborhood: data.neighborhood ? sanitizeText(data.neighborhood) : null,
        latitude: data.latitude,
        longitude: data.longitude,
        userId: user.id,
        expiresAt,
        images: { create: data.images.map((url, order) => ({ url, order })) },
        attributeValues: {
          create: data.attributes.map((a) => ({
            attributeId: a.attributeId,
            value: sanitizeText(a.value),
          })),
        },
      },
      select: { id: true },
    });

    return ok(listing, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
