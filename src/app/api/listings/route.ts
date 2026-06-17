import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { createListingSchema } from "@/lib/validations/listing.schema";
import { sanitizeText } from "@/lib/sanitization/sanitize";
import { ok, fail, handleApiError, RATE_LIMITED } from "@/lib/utils/api";
import { limiters, checkLimit } from "@/lib/ratelimit";
import { getRecentListings } from "@/services/listings";

export const dynamic = "force-dynamic";

/** GET /api/listings — recent active listings (public). */
export async function GET() {
  try {
    const items = await getRecentListings(20);
    return ok(items);
  } catch (err) {
    return handleApiError(err);
  }
}

/** POST /api/listings — create or repost a listing (auth + Zod + sanitize + rate limit). */
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    if (!(await checkLimit(limiters.listingCreate, user.id))) return RATE_LIMITED();

    const body = await req.json() as Record<string, unknown>;

    // Repost: clone an expired/removed listing owned by this user.
    if (typeof body.repostFromId === "string") {
      const source = await prisma.listing.findFirst({
        where: { id: body.repostFromId, userId: user.id },
        include: { images: { orderBy: { order: "asc" } }, attributeValues: true },
      });
      if (!source) return fail("Listing not found or not yours", 404);

      if (source.status === "ACTIVE") {
        return fail("This listing is already active", 400);
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      const newListing = await prisma.listing.create({
        data: {
          title: source.title,
          description: source.description,
          price: source.price,
          negotiable: source.negotiable,
          condition: source.condition,
          categoryId: source.categoryId,
          city: source.city,
          district: source.district,
          neighborhood: source.neighborhood,
          latitude: source.latitude,
          longitude: source.longitude,
          userId: user.id,
          expiresAt,
          status: "ACTIVE",
          images: { create: source.images.map((img) => ({ url: img.url, order: img.order })) },
          attributeValues: { create: source.attributeValues.map((av) => ({ attributeId: av.attributeId, value: av.value })) },
        },
        select: { id: true },
      });
      return ok(newListing, { status: 201 });
    }

    const data = createListingSchema.parse(body);

    if (data.images.length > 7) return fail("Maximum 7 photos", 422);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

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
    console.error("[POST listings] ERROR:", err instanceof Error ? err.message : String(err));
    return handleApiError(err);
  }
}
