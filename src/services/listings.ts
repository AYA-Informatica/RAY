import { prisma } from "@/lib/prisma";
import type { ListingCardData, ListingDetailData, Paginated } from "@/types";
import { DEMO_LISTINGS } from "./fixtures";
import { distanceKm as haversine } from "@/lib/utils/format";
import type { SearchQuery } from "@/lib/validations/search.schema";

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
    coverImage: l.images[0]?.url ?? null,
    category: { slug: l.category.slug, name: l.category.name, icon: l.category.icon ?? "📦" },
    distanceKm:
      origin && l.latitude != null && l.longitude != null
        ? haversine(origin, { lat: l.latitude, lng: l.longitude })
        : null,
  };
}

/** Home feed — newest active listings. Falls back to demo data pre-DB. */
export async function getRecentListings(limit = 12): Promise<ListingCardData[]> {
  try {
    const rows = await queryListings({}, limit, 0);
    if (rows.length) return rows.map((r) => toCard(r));
    return DEMO_LISTINGS.slice(0, limit);
  } catch {
    return DEMO_LISTINGS.slice(0, limit);
  }
}

/** Full search with filters + location-aware ranking. */
export async function searchListings(q: SearchQuery): Promise<Paginated<ListingCardData>> {
  const where: Record<string, unknown> = {};
  if (q.q) {
    where.OR = [
      { title: { contains: q.q, mode: "insensitive" } },
      { description: { contains: q.q, mode: "insensitive" } },
    ];
  }
  if (q.category) where.category = { slug: q.category };
  if (q.city) where.city = q.city;
  if (q.district) where.district = q.district;
  if (q.condition) where.condition = q.condition;
  if (q.minPrice != null || q.maxPrice != null) {
    where.price = {
      ...(q.minPrice != null ? { gte: q.minPrice } : {}),
      ...(q.maxPrice != null ? { lte: q.maxPrice } : {}),
    };
  }

  const skip = (q.page - 1) * q.pageSize;
  try {
    const [rows, total] = await Promise.all([
      queryListings(where, q.pageSize, skip),
      prisma.listing.count({ where: { status: "ACTIVE", ...where } }),
    ]);
    const origin = q.lat != null && q.lng != null ? { lat: q.lat, lng: q.lng } : undefined;
    let items = rows.map((r) => toCard(r, origin));

    // Distance filter + closest-first ranking (RAY's hyperlocal weapon).
    if (origin && q.radius && q.radius > 0) {
      items = items.filter((i) => i.distanceKm != null && i.distanceKm <= q.radius!);
    }
    if (origin) {
      items.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    }

    return { items, page: q.page, pageSize: q.pageSize, total, hasMore: skip + rows.length < total };
  } catch {
    const filtered = DEMO_LISTINGS.filter(
      (l) =>
        (!q.q || l.title.toLowerCase().includes(q.q.toLowerCase())) &&
        (!q.category || l.category.slug === q.category),
    );
    return {
      items: filtered,
      page: 1,
      pageSize: q.pageSize,
      total: filtered.length,
      hasMore: false,
    };
  }
}

/** Single listing for the detail page. Increments view count. */
export async function getListing(id: string): Promise<ListingDetailData | null> {
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
    const listingsCount = await prisma.listing.count({
      where: { userId: l.userId, status: "ACTIVE" },
    });
    return { ...l, user: { ...l.user, listingsCount } };
  } catch {
    return null;
  }
}

/** Listings owned by a user (all statuses), for the My Ads management screen. */
export async function getUserListings(userId: string): Promise<ListingCardData[]> {
  try {
    const rows = await prisma.listing.findMany({
      where: { userId },
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
      coverImage: r.images[0]?.url ?? null,
      category: { slug: r.category.slug, name: r.category.name, icon: r.category.icon ?? "📦" },
    }));
  } catch {
    return [];
  }
}

/** A single listing owned by the user, for editing (returns null if not owner). */
export async function getOwnedListing(id: string, userId: string) {
  try {
    return await prisma.listing.findFirst({
      where: { id, userId },
      include: {
        category: { include: { attributes: { orderBy: { order: "asc" } } } },
        images: { orderBy: { order: "asc" } },
        attributeValues: { include: { attribute: true } },
      },
    });
  } catch {
    return null;
  }
}
