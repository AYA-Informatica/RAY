import { prisma } from "@/lib/prisma";
import type { ListingCardData } from "@/types";

/** Listing IDs the user has favorited (for store hydration). */
export async function getFavoriteIds(userId: string): Promise<string[]> {
  const favs = await prisma.favorite.findMany({
    where: { userId },
    select: { listingId: true },
  });
  return favs.map((f) => f.listingId);
}

/** Full favorited listings as cards. */
export async function getFavoriteListings(userId: string): Promise<ListingCardData[]> {
  const favs = await prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      listing: {
        include: { category: true, images: { take: 1, orderBy: { order: "asc" } } },
      },
    },
  });
  return favs
    .filter((f) => f.listing.status === "ACTIVE")
    .map((f) => ({
      id: f.listing.id,
      title: f.listing.title,
      price: f.listing.price,
      negotiable: f.listing.negotiable,
      city: f.listing.city,
      district: f.listing.district,
      neighborhood: f.listing.neighborhood,
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
