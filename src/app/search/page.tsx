import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ListingGridSkeleton } from "@/components/listings/ListingGrid";
import { getCategories } from "@/services/categories";
import { SearchClient } from "./SearchClient";
import { logger } from "@/lib/logger";

export const metadata = { title: "Search" };

/** Search entry — loads categories, renders the client search UI. */
export default async function SearchPage() {
  logger.debug("[SearchPage] rendering");
  const categories = await getCategories();
  logger.debug({ categoryCount: categories.length }, "[SearchPage] categories loaded");
  return (
    <AppShell width="wide">
      <Suspense fallback={<div className="p-4"><ListingGridSkeleton /></div>}>
        <SearchClient
          categories={categories.map((c) => ({ slug: c.slug, name: c.name, icon: c.icon ?? "📦" }))}
        />
      </Suspense>
    </AppShell>
  );
}
