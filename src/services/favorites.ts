import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { ListingCardData } from "@/types";

/** Listing IDs the user has favorited (for store hydration). */
export async function getFavoriteIds(userId: string): Promise<string[]> {
  logger.debug({ userId }, "[getFavoriteIds] called");
  const favs = await prisma.favorite.findMany({
    where: { userId },
    select: { listingId: true },
  });
  const ids = favs.map((f) => f.listingId);
  logger.debug({ userId, count: ids.length }, "[getFavoriteIds] result");
  return ids;
}

/** Full favorited listings as cards. */
export async function getFavoriteListings(userId: string): Promise<ListingCardData[]> {
  logger.debug({ userId }, "[getFavoriteListings] called");
  const favs = await prisma.favorite.findMany({
    where: { userId, listing: { status: "ACTIVE" } },
    orderBy: { createdAt: "desc" },
    include: {
      listing: {
        include: { category: true, images: { take: 1, orderBy: { order: "asc" } } },
      },
    },
  });
  logger.debug({ userId, count: favs.length }, "[getFavoriteListings] result");
  return favs.map((f) => ({
      id: f.listing.id,
      title: f.listing.title,
      price: f.listing.price,
      negotiable: f.listing.negotiable,
      city: f.listing.city,
      district: f.listing.district,
      neighborhood: f.listing.neighborhood,
      province: f.listing.province,
      sector: f.listing.sector,
      createdAt: f.listing.createdAt,
      status: f.listing.status,
      views: f.listing.views,
      featured: f.listing.featured,
      coverImage: f.listing.images[0]?.url ?? null,
      category: {
        slug: f.listing.category.slug,
        name: f.listing.category.name,
        icon: f.listing.category.icon ?? "📦",
      },
      isFavorite: true,
    }));
}
