import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { LocationHeader } from "@/components/layout/LocationHeader";
import { RecentListings } from "@/components/listings/RecentListings";
import { RecentlyViewed } from "@/components/listings/RecentlyViewed";
import { FavoritesProvider } from "@/components/shared/FavoritesProvider";
import { getCategories } from "@/services/categories";
import { getRankedRecentListings } from "@/services/listings";
import { getFavoriteIds } from "@/services/favorites";
import { getCurrentUser } from "@/lib/auth/session";
import { serverT } from "@/i18n/server";

const PAGE_SIZE = 15;

export async function HomeContent() {
  const user = await getCurrentUser();
  const [categories, recent, favoriteIds] = await Promise.all([
    getCategories(),
    getRankedRecentListings(
      { profileLocation: user ? { city: user.city, district: user.district, neighborhood: user.neighborhood } : undefined },
      PAGE_SIZE,
    ),
    user ? getFavoriteIds(user.id) : Promise.resolve([]),
  ]);

  // Show user's city if known, otherwise fall back to "Rwanda".
  const locationLabel = user?.city ?? "Rwanda";

  return (
    <AppShell width="wide">
      <FavoritesProvider initialIds={favoriteIds} />

      <h1 className="sr-only">{serverT("nav.home")}</h1>

      <div className="lg:hidden">
        <LocationHeader location={locationLabel} />
      </div>

      {/* Browse Categories */}
      <section className="px-4 pt-5 sm:px-6 lg:pt-8">
        <h2 className="mb-3 font-display text-lg font-bold lg:text-xl">{serverT("home.browseCategories")}</h2>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/search?category=${c.slug}`}
              className="flex flex-col items-center gap-1.5 rounded-xl p-1 transition-colors hover:bg-surface-card/60 active:scale-95"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-card text-2xl">
                {c.icon}
              </span>
              <span className="text-center text-[10px] font-medium leading-tight text-text-secondary">
                {c.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recently Viewed — localStorage-backed, only shows after a listing visit */}
      <RecentlyViewed />

      {/* Recent Listings */}
      <section className="space-y-3 px-4 pb-4 pt-6 sm:px-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold lg:text-xl">{serverT("home.recentListings")}</h2>
          <Link href="/search" className="text-sm text-primary hover:underline">
            {serverT("home.seeAll")}
          </Link>
        </div>

        <RecentListings initial={recent} />
      </section>
    </AppShell>
  );
}
