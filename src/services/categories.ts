import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { LAUNCH_CATEGORIES } from "@/constants/categories";
import type { CategoryWithAttributes } from "@/types";

/** All categories ordered for the grid — cached for 1 hour since categories rarely change. */
export const getCategories = unstable_cache(
  async () => {
    logger.debug({}, "[getCategories] called");
    try {
      const cats = await prisma.category.findMany({ orderBy: { order: "asc" } });
      if (cats.length) {
        logger.debug({ count: cats.length, source: "db" }, "[getCategories] result");
        return cats;
      }
    } catch (err) {
      // DB not configured yet
      logger.debug({ error: err instanceof Error ? err.message : String(err) }, "[getCategories] DB unavailable, using fallback");
    }
    const fallback = LAUNCH_CATEGORIES.map((c, i) => ({
      id: c.slug,
      name: c.name,
      nameRw: null,
      nameFr: null,
      slug: c.slug,
      icon: c.icon,
      order: i,
      createdAt: new Date(),
    }));
    logger.debug({ count: fallback.length, source: "fallback" }, "[getCategories] result");
    return fallback;
  },
  ["categories"],
  { revalidate: 3600 },
);

/** A category plus its dynamic attribute schema (for the Sell flow). */
export async function getCategoryWithAttributes(
  slug: string,
): Promise<CategoryWithAttributes | null> {
  logger.debug({ slug }, "[getCategoryWithAttributes] called");
  try {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: { attributes: { orderBy: { order: "asc" } } },
    });
    logger.debug({ slug, found: !!category }, "[getCategoryWithAttributes] result");
    return category;
  } catch (err) {
    logger.debug({ slug, error: err instanceof Error ? err.message : String(err) }, "[getCategoryWithAttributes] failed");
    return null;
  }
}
