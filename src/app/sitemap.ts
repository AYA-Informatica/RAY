import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Dynamic sitemap: static routes + active listings (SEO requirement). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/home`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/search`, changeFrequency: "hourly", priority: 0.8 },
  ];

  try {
    // Category landing pages — meaningful SEO targets.
    const categories = await prisma.category.findMany({ select: { slug: true } });
    const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
      url: `${base}/search?category=${c.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.75,
    }));
    const listings = await prisma.listing.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, updatedAt: true },
      take: 5000,
      orderBy: { createdAt: "desc" },
    });
    const listingRoutes: MetadataRoute.Sitemap = listings.map((l) => ({
      url: `${base}/listing/${l.id}`,
      lastModified: l.updatedAt,
      changeFrequency: "daily",
      priority: 0.7,
    }));
    logger.debug(
      { categories: categoryRoutes.length, listings: listingRoutes.length },
      "[Sitemap] generated"
    );
    return [...staticRoutes, ...categoryRoutes, ...listingRoutes];
  } catch (err) {
    logger.warn({ message: err instanceof Error ? err.message : String(err) }, "[Sitemap] generation failed, falling back to static routes");
    return staticRoutes;
  }
}
