import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { createListingSchema } from "@/lib/validations/listing.schema";
import { sanitizeText } from "@/lib/sanitization/sanitize";
import { ok, fail, handleApiError, RATE_LIMITED } from "@/lib/utils/api";
import { limiters, checkLimit } from "@/lib/ratelimit";
import { getRecentListings, searchListings, getUserListings } from "@/services/listings";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * GET /api/listings — public feed by default, or a caller-scoped view via
 * query params (used by the mobile app):
 *   ?mine=true       — the signed-in caller's own listings (requires auth)
 *   ?category=slug   — recent listings in one category (used for "similar listings")
 *   ?limit=n         — cap result count (default 20, capped at 50)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);
    const category = searchParams.get("category");
    const mine = searchParams.get("mine") === "true";

    if (mine) {
      const user = await requireUser();
      logger.debug({ userId: user.id }, "[GET listings] mine=true request received");
      const items = await getUserListings(user.id);
      logger.debug({ userId: user.id, count: items.length }, "[GET listings] mine=true success");
      return ok(items);
    }

    if (category) {
      logger.debug({ category, limit }, "[GET listings] category request received");
      const result = await searchListings({ category, page: 1, pageSize: limit });
      logger.debug({ category, count: result.items.length }, "[GET listings] category success");
      return ok(result.items);
    }

    logger.debug({ limit }, "[GET listings] request received");
    const items = await getRecentListings(limit);
    logger.debug({ count: items.length }, "[GET listings] success");
    return ok(items);
  } catch (err) {
    return handleApiError(err);
  }
}

/** POST /api/listings — create or repost a listing (auth + Zod + sanitize + rate limit). */
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    if (!(await checkLimit(limiters.listingCreate, user.id))) {
      logger.warn({ userId: user.id }, "[POST listings] rejected: rate limited");
      return RATE_LIMITED();
    }

    const body = await req.json() as Record<string, unknown>;
    logger.debug(
      { userId: user.id, repostFromId: body.repostFromId },
      "[POST listings] request received",
    );

    // Repost: clone an expired/removed listing owned by this user.
    if (typeof body.repostFromId === "string") {
      const newListing = await prisma.$transaction(async (tx) => {
        const source = await tx.listing.findFirst({
          where: { id: body.repostFromId as string, userId: user.id },
          include: { images: { orderBy: { order: "asc" } }, attributeValues: true },
        });
        if (!source) return null;
        if (source.status === "ACTIVE") return "ALREADY_ACTIVE" as const;

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        return tx.listing.create({
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
            province: source.province,
            sector: source.sector,
            village: source.village,
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
      });
      if (newListing === null) {
        logger.warn(
          { userId: user.id, repostFromId: body.repostFromId },
          "[POST listings] rejected: repost source not found or not owned",
        );
        return fail("Listing not found or not yours", 404);
      }
      if (newListing === "ALREADY_ACTIVE") {
        logger.warn(
          { userId: user.id, repostFromId: body.repostFromId },
          "[POST listings] rejected: repost source already active",
        );
        return fail("This listing is already active", 400);
      }
      logger.info({ userId: user.id, listingId: newListing.id }, "[POST listings] reposted");
      return ok(newListing, { status: 201 });
    }

    const data = createListingSchema.parse(body);

    if (data.images.length > 7) {
      logger.warn({ userId: user.id, imageCount: data.images.length }, "[POST listings] rejected: too many photos");
      return fail("Maximum 7 photos", 422);
    }

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
        province: data.province ? sanitizeText(data.province) : null,
        sector: data.sector ? sanitizeText(data.sector) : null,
        village: data.village ? sanitizeText(data.village) : null,
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

    logger.info({ userId: user.id, listingId: listing.id }, "[POST listings] created");
    return ok(listing, { status: 201 });
  } catch (err) {
    logger.error({ err }, "[POST listings] ERROR");
    return handleApiError(err);
  }
}
