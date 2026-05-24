import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ListingGridSkeleton } from "@/components/listings/ListingGrid";
import { getCategories } from "@/services/categories";
import { SearchClient } from "./SearchClient";

export const metadata = { title: "Search" };

/** Search entry — loads categories, renders the client search UI. */
export default async function SearchPage() {
  const categories = await getCategories();
  return (
    <AppShell>
      <Suspense fallback={<div className="p-4"><ListingGridSkeleton /></div>}>
        <SearchClient
          categories={[
            { slug: "all", name: "All", icon: "🔎" },
            ...categories.map((c) => ({ slug: c.slug, name: c.name, icon: c.icon ?? "📦" })),
          ]}
        />
      </Suspense>
    </AppShell>
  );
}
