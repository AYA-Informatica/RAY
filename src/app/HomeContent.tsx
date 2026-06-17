import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { LocationHeader } from "@/components/layout/LocationHeader";
import { CategoryBrowser } from "@/components/home/CategoryBrowser";
import { RecentListings } from "@/components/listings/RecentListings";
import { RecentlyViewed } from "@/components/listings/RecentlyViewed";
import { FavoritesProvider } from "@/components/shared/FavoritesProvider";
import { getCategories } from "@/services/categories";
import { getRankedRecentListings } from "@/services/listings";
import { getFavoriteIds } from "@/services/favorites";
import { getCurrentUser } from "@/lib/auth/session";
import { serverT } from "@/i18n/server";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 15;

export async function HomeContent() {
  const user = await getCurrentUser();
  const [categories, recent, favoriteIds, announcementRow] = await Promise.all([
    getCategories(),
    getRankedRecentListings(
      { profileLocation: user ? { city: user.city, district: user.district, neighborhood: user.neighborhood } : undefined },
      PAGE_SIZE,
    ),
    user ? getFavoriteIds(user.id) : Promise.resolve([]),
    prisma.siteConfig.findUnique({ where: { key: "announcement" } }).catch(() => null),
  ]);

  const announcement = announcementRow
    ? (JSON.parse(announcementRow.value) as { active: boolean; text: string })
    : null;

  // Show user's city if known, otherwise fall back to "Rwanda".
  const locationLabel = user?.city ?? "Rwanda";

  return (
    <AppShell width="wide">
      <FavoritesProvider initialIds={favoriteIds} />

      <h1 className="sr-only">{serverT("nav.home")}</h1>

      <div className="lg:hidden">
        <LocationHeader location={locationLabel} />
      </div>

      {/* Announcement banner */}
      {announcement?.active && announcement.text && (
        <div className="mx-4 mt-4 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-text-primary sm:mx-6">
          {announcement.text}
        </div>
      )}

      {/* Browse Categories */}
      <CategoryBrowser categories={categories} title={serverT("home.browseCategories")} />

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
