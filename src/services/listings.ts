import { cache } from "react";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ListingCardData, ListingDetailData, Paginated } from "@/types";
import { distanceKm as haversine } from "@/lib/utils/format";
import type { SearchQuery } from "@/lib/validations/search.schema";
import { getSellerResponseTime } from "./chat";

type RawListing = Awaited<ReturnType<typeof queryListings>>[number];

async function queryListings(where: object, take: number, skip: number) {
  return prisma.listing.findMany({
    where: { status: "ACTIVE", ...where },
    take,
    skip,
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      images: { orderBy: { order: "asc" }, take: 1 },
    },
  });
}

function toCard(l: RawListing, origin?: { lat: number; lng: number }): ListingCardData {
  return {
    id: l.id,
    title: l.title,
    price: l.price,
    negotiable: l.negotiable,
    city: l.city,
    district: l.district,
    neighborhood: l.neighborhood,
    createdAt: l.createdAt,
    status: l.status,
    views: l.views,
    coverImage: l.images[0]?.url ?? null,
    category: { slug: l.category.slug, name: l.category.name, icon: l.category.icon ?? "📦" },
    distanceKm:
      origin && l.latitude != null && l.longitude != null
        ? haversine(origin, { lat: l.latitude, lng: l.longitude })
        : null,
  };
}

/** Home feed — newest active listings. */
export async function getRecentListings(limit = 12): Promise<ListingCardData[]> {
  const rows = await queryListings({}, limit, 0);
  return rows.map((r) => toCard(r));
}

// Pull a larger pool than we display so nearby-but-older listings have a
// chance to outrank far-away-but-newer ones once we re-rank below.
const RECENT_RANKING_POOL_SIZE = 200;
// Candidate pool for location-aware search — large enough to cover all
// listings within a bounding box for typical radius/city sizes.
const GEO_SEARCH_POOL_SIZE = 200;
// Recency contributes a full point at age 0 and decays to ~37% after 3 days.
const RECENCY_HALF_LIFE_HOURS = 72;
// Proximity contributes a full point at 0km and decays to ~37% at 20km.
const PROXIMITY_DECAY_KM = 20;
// Score given when we have no location signal at all (no GPS, no profile
// location) — keeps listings in the running on recency alone.
const NEUTRAL_PROXIMITY_SCORE = 0.3;
// Text-based proximity scores when ranking by the viewer's profile location
// (city/district/neighborhood) instead of GPS coordinates.
const PROFILE_NEIGHBORHOOD_MATCH_SCORE = 1;
const PROFILE_DISTRICT_MATCH_SCORE = 0.7;
const PROFILE_CITY_MATCH_SCORE = 0.4;
const PROFILE_NO_MATCH_SCORE = 0.1;

export interface ProfileLocation {
  city?: string | null;
  district?: string | null;
  neighborhood?: string | null;
}

/** Coarse text-based proximity when the viewer has no GPS fix but does have a saved profile location. */
function profileProximityScore(
  listing: { city: string | null; district: string | null; neighborhood: string | null },
  profile: ProfileLocation,
): number {
  if (profile.neighborhood && listing.neighborhood === profile.neighborhood) return PROFILE_NEIGHBORHOOD_MATCH_SCORE;
  if (profile.district && listing.district === profile.district) return PROFILE_DISTRICT_MATCH_SCORE;
  if (profile.city && listing.city === profile.city) return PROFILE_CITY_MATCH_SCORE;
  return PROFILE_NO_MATCH_SCORE;
}

/**
 * Home feed — newest active listings, re-ranked so nearby listings are
 * pushed up without hiding anything. Every ACTIVE listing in the pool stays
 * eligible; only the display order changes based on a blended
 * recency/proximity score.
 *
 * Proximity comes from `origin` (precise GPS) when available, falling back
 * to `profileLocation` (coarse city/district/neighborhood match), falling
 * back to a neutral score (recency-only ordering) when neither is known.
 */
export async function getRankedRecentListings(
  opts: { origin?: { lat: number; lng: number }; profileLocation?: ProfileLocation } = {},
  limit = 12,
): Promise<ListingCardData[]> {
  const { origin, profileLocation } = opts;
  const rows = await queryListings({}, RECENT_RANKING_POOL_SIZE, 0);
  const now = Date.now();

  const scored = rows.map((r) => {
    const card = toCard(r, origin);
    const ageHours = (now - r.createdAt.getTime()) / (1000 * 60 * 60);
    const recencyScore = Math.exp(-ageHours / RECENCY_HALF_LIFE_HOURS);
    let proximityScore: number;
    if (card.distanceKm != null) {
      proximityScore = Math.exp(-card.distanceKm / PROXIMITY_DECAY_KM);
    } else if (profileLocation && (profileLocation.city || profileLocation.district || profileLocation.neighborhood)) {
      proximityScore = profileProximityScore(r, profileLocation);
    } else {
      proximityScore = NEUTRAL_PROXIMITY_SCORE;
    }
    return { card, score: 0.5 * recencyScore + 0.5 * proximityScore };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.card);
}

/** Full search with filters + location-aware ranking. */
export async function searchListings(q: SearchQuery): Promise<Paginated<ListingCardData>> {
  const where: Record<string, unknown> = {};
  if (q.q) {
    where.OR = [
      { title: { contains: q.q, mode: "insensitive" } },
      { description: { contains: q.q, mode: "insensitive" } },
      { attributeValues: { some: { value: { contains: q.q, mode: "insensitive" } } } },
      { city: { contains: q.q, mode: "insensitive" } },
      { district: { contains: q.q, mode: "insensitive" } },
      { neighborhood: { contains: q.q, mode: "insensitive" } },
      { category: { is: { name: { contains: q.q, mode: "insensitive" } } } },
    ];
  }
  if (q.category) where.category = { slug: q.category };
  if (q.city) where.city = q.city;
  if (q.district) where.district = q.district;
  if (q.neighborhood) where.neighborhood = q.neighborhood;
  if (q.condition) where.condition = q.condition;
  if (q.brand) {
    where.attributeValues = {
      some: {
        attribute: { is: { key: "brand" } },
        value: { equals: q.brand, mode: "insensitive" },
      },
    };
  }
  if (q.minPrice != null || q.maxPrice != null) {
    where.price = {
      ...(q.minPrice != null ? { gte: q.minPrice } : {}),
      ...(q.maxPrice != null ? { lte: q.maxPrice } : {}),
    };
  }

  const skip = (q.page - 1) * q.pageSize;
  const origin = q.lat != null && q.lng != null ? { lat: q.lat, lng: q.lng } : undefined;

  if (origin) {
    // Location-aware search: Prisma can't express haversine distance in
    // `where`/`orderBy`, so pull a larger candidate pool (pre-filtered to a
    // bounding box around `origin` when a radius is set), then compute exact
    // distance, filter, sort nearest-first, and paginate in JS. Without this,
    // the radius filter only ever saw the newest `pageSize` rows and silently
    // dropped/missed listings outside that window.
    let geoWhere: Record<string, unknown> = where;
    if (q.radius && q.radius > 0) {
      const latDelta = q.radius / 111; // ~111km per degree latitude
      const lngDelta = q.radius / (111 * Math.cos((origin.lat * Math.PI) / 180));
      geoWhere = {
        ...where,
        latitude: { gte: origin.lat - latDelta, lte: origin.lat + latDelta },
        longitude: { gte: origin.lng - lngDelta, lte: origin.lng + lngDelta },
      };
    }
    const rows = await queryListings(geoWhere, GEO_SEARCH_POOL_SIZE, 0);
    let items = rows.map((r) => toCard(r, origin));
    if (q.radius && q.radius > 0) {
      items = items.filter((i) => i.distanceKm != null && i.distanceKm <= q.radius!);
    }
    items.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));

    const total = items.length;
    const paged = items.slice(skip, skip + q.pageSize);
    return { items: paged, page: q.page, pageSize: q.pageSize, total, hasMore: skip + paged.length < total };
  }

  const [rows, total] = await Promise.all([
    queryListings(where, q.pageSize, skip),
    prisma.listing.count({ where: { status: "ACTIVE", ...where } }),
  ]);
  const items = rows.map((r) => toCard(r));
  return { items, page: q.page, pageSize: q.pageSize, total, hasMore: skip + rows.length < total };
}

/** Single listing for the detail page. Increments view count.
 *  Memoized per-request — generateMetadata and the page component both call
 *  this for the same id, and without caching that doubles the view-count
 *  increment and the concurrent-query load on the connection pool. */
export const getListing = cache(async (id: string): Promise<ListingDetailData | null> => {
  try {
    const l = await prisma.listing.update({
      where: { id },
      data: { views: { increment: 1 } },
      include: {
        category: true,
        images: { orderBy: { order: "asc" } },
        user: true,
        attributeValues: { include: { attribute: true } },
      },
    });
    const [listingsCount, responseTimeMins] = await Promise.all([
      prisma.listing.count({ where: { userId: l.userId, status: "ACTIVE" } }),
      getSellerResponseTime(l.userId),
    ]);
    return { ...l, user: { ...l.user, listingsCount, responseTimeMins } };
  } catch (err) {
    // P2025 = record not found — valid 404, not a bug
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") return null;
    console.error("[getListing] DB error id=", id, err instanceof Error ? err.message : err);
    throw err;
  }
});

/** Listings owned by a user (active, sold, expired, flagged), for the My Ads management screen.
 * Excludes REMOVED listings by default (user deleted them). */
export async function getUserListings(userId: string, includeRemoved = false): Promise<ListingCardData[]> {
  const where: { userId: string; status?: { not: "REMOVED" } } = { userId };
  if (!includeRemoved) {
    where.status = { not: "REMOVED" };
  }
  const rows = await prisma.listing.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { category: true, images: { orderBy: { order: "asc" }, take: 1 } },
  });
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    price: r.price,
    negotiable: r.negotiable,
    city: r.city,
    district: r.district,
    neighborhood: r.neighborhood,
    createdAt: r.createdAt,
    status: r.status,
    views: r.views,
    coverImage: r.images[0]?.url ?? null,
    category: { slug: r.category.slug, name: r.category.name, icon: r.category.icon ?? "📦" },
  }));
}

/** A single listing owned by the user, for editing (returns null if not owner). */
export async function getOwnedListing(id: string, userId: string) {
  return prisma.listing.findFirst({
    where: { id, userId },
    include: {
      category: { include: { attributes: { orderBy: { order: "asc" } } } },
      images: { orderBy: { order: "asc" } },
      attributeValues: { include: { attribute: true } },
    },
  });
}
