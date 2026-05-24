import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Dynamic sitemap: static routes + active listings (SEO requirement). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/home`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/search`, changeFrequency: "hourly", priority: 0.8 },
  ];

  try {
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
    return [...staticRoutes, ...listingRoutes];
  } catch {
    return staticRoutes;
  }
}
