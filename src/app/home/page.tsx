import Link from "next/link";
import { Rocket } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { LocationHeader } from "@/components/layout/LocationHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ListingRow } from "@/components/listings/ListingCard";
import { FavoritesProvider } from "@/components/shared/FavoritesProvider";
import { getCategories } from "@/services/categories";
import { getRecentListings } from "@/services/listings";
import { getFavoriteIds } from "@/services/favorites";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata = { title: "Home" };

/**
 * Marketplace home. Layout mirrors the wireframe:
 *   Location header + search · Browse Categories grid · Premium banner ·
 *   Recent Listings rail.
 * Dark theme per the (newer) Brand & Design System.
 */
export default async function HomePage() {
  const user = await getCurrentUser();
  const [categories, recent, favoriteIds] = await Promise.all([
    getCategories(),
    getRecentListings(12),
    user ? getFavoriteIds(user.id) : Promise.resolve([]),
  ]);

  return (
    <AppShell>
      <FavoritesProvider initialIds={favoriteIds} />
      <LocationHeader location="Rwanda" />

      {/* Browse Categories */}
      <section className="px-4 pt-5">
        <h2 className="mb-3 font-display text-lg font-bold">Browse Categories</h2>
        <div className="grid grid-cols-4 gap-y-5">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/search?category=${c.slug}`}
              className="flex flex-col items-center gap-1"
            >
              <span className="text-3xl">{c.icon}</span>
              <span className="text-xs font-medium text-text-primary">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Premium banner (navy = exclusivity per design psychology) */}
      <section className="px-4 pt-6">
        <Card className="border-none bg-navy p-5">
          <h3 className="font-display text-xl font-bold">Sell Faster with Premium</h3>
          <p className="mt-1 text-sm text-text-secondary">Get 3x more visibility for your listings</p>
          <Button variant="secondary" size="sm" className="mt-4 bg-text-primary text-primary">
            Upgrade Now
          </Button>
        </Card>
      </section>

      {/* Recent Listings */}
      <section className="space-y-3 px-4 pb-4 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Recent Listings</h2>
          <Link href="/search" className="text-sm text-primary">
            See all
          </Link>
        </div>
        {recent.length === 0 ? (
          <Card className="flex flex-col items-center gap-2 p-8 text-center">
            <Rocket className="text-text-muted" />
            <p className="text-sm text-text-secondary">No listings yet — be the first to post.</p>
            <Link href="/sell">
              <Button size="sm">Post an ad</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {recent.map((l) => (
              <ListingRow key={l.id} listing={l} />
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
