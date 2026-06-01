import Link from "next/link";
import { Rocket } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { LocationHeader } from "@/components/layout/LocationHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ListingRow, ListingCard } from "@/components/listings/ListingCard";
import { RecentlyViewed } from "@/components/listings/RecentlyViewed";
import { FavoritesProvider } from "@/components/shared/FavoritesProvider";
import { getCategories } from "@/services/categories";
import { getRecentListings } from "@/services/listings";
import { getFavoriteIds } from "@/services/favorites";
import { getCurrentUser } from "@/lib/auth/session";

const PAGE_SIZE = 15;

export async function HomeContent() {
  const user = await getCurrentUser();
  const [categories, recent, favoriteIds] = await Promise.all([
    getCategories(),
    getRecentListings(PAGE_SIZE),
    user ? getFavoriteIds(user.id) : Promise.resolve([]),
  ]);

  // Show user's city if known, otherwise fall back to "Rwanda".
  const locationLabel = user?.city ?? "Rwanda";

  return (
    <AppShell width="wide">
      <FavoritesProvider initialIds={favoriteIds} />

      <div className="lg:hidden">
        <LocationHeader location={locationLabel} />
      </div>

      {/* Browse Categories */}
      <section className="px-4 pt-5 sm:px-6 lg:pt-8">
        <h2 className="mb-3 font-display text-lg font-bold lg:text-xl">Browse Categories</h2>
        <div className="grid grid-cols-4 gap-y-5 sm:grid-cols-6 lg:grid-cols-8">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/search?category=${c.slug}`}
              className="flex flex-col items-center gap-1 rounded-md py-2 transition-colors hover:bg-surface-card"
            >
              <span className="text-3xl">{c.icon}</span>
              <span className="text-xs font-medium text-text-primary">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recently Viewed — localStorage-backed, only shows after a listing visit */}
      <RecentlyViewed />

      {/* Recent Listings */}
      <section className="space-y-3 px-4 pb-4 pt-6 sm:px-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold lg:text-xl">Recent Listings</h2>
          <Link href="/search" className="text-sm text-primary hover:underline">
            See all
          </Link>
        </div>

        {recent.length === 0 ? (
          <Card className="flex flex-col items-center gap-2 p-8 text-center">
            <Rocket className="text-text-secondary" />
            <p className="text-sm text-text-secondary">No listings yet — be the first to post.</p>
            <Link href="/sell">
              <Button size="sm">Post an ad</Button>
            </Link>
          </Card>
        ) : (
          <>
            <div className="space-y-3 sm:hidden">
              {recent.map((l) => (
                <ListingRow key={l.id} listing={l} />
              ))}
            </div>
            <div className="hidden grid-cols-3 gap-4 sm:grid lg:grid-cols-4 xl:grid-cols-5">
              {recent.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
            {recent.length === PAGE_SIZE && (
              <div className="pt-2 text-center">
                <Link href="/search">
                  <Button variant="secondary" size="sm">See all listings</Button>
                </Link>
              </div>
            )}
          </>
        )}
      </section>
    </AppShell>
  );
}
