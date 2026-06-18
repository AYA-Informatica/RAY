import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { LAUNCH_CATEGORIES } from "@/constants/categories";
import type { CategoryWithAttributes } from "@/types";

/** All categories ordered for the grid — cached for 1 hour since categories rarely change. */
export const getCategories = unstable_cache(
  async () => {
    try {
      const cats = await prisma.category.findMany({ orderBy: { order: "asc" } });
      if (cats.length) return cats;
    } catch {
      // DB not configured yet
    }
    return LAUNCH_CATEGORIES.map((c, i) => ({
      id: c.slug,
      name: c.name,
      slug: c.slug,
      icon: c.icon,
      order: i,
      createdAt: new Date(),
    }));
  },
  ["categories"],
  { revalidate: 3600 },
);

/** A category plus its dynamic attribute schema (for the Sell flow). */
export async function getCategoryWithAttributes(
  slug: string,
): Promise<CategoryWithAttributes | null> {
  try {
    return await prisma.category.findUnique({
      where: { slug },
      include: { attributes: { orderBy: { order: "asc" } } },
    });
  } catch {
    return null;
  }
}
