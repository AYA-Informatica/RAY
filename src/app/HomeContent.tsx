import { Suspense } from "react";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import { AppShell } from "@/components/layout/AppShell";
import { LocationHeader } from "@/components/layout/LocationHeader";
import { CategoryBrowser } from "@/components/home/CategoryBrowser";
import { RecentListings } from "@/components/listings/RecentListings";
import { RecentlyViewed } from "@/components/listings/RecentlyViewed";
import { Skeleton } from "@/components/ui/Skeleton";
import { getCategories } from "@/services/categories";
import { getRankedRecentListings } from "@/services/listings";
import { getCurrentUser } from "@/lib/auth/session";
import { serverT } from "@/i18n/server";
import { prisma } from "@/lib/prisma";
import type { ProfileLocation } from "@/services/listings";

const getAnnouncement = unstable_cache(
  async () => {
    const row = await prisma.siteConfig.findUnique({ where: { key: "announcement" } }).catch(() => null);
    if (!row) return null;
    return JSON.parse(row.value) as { active: boolean; text: string };
  },
  ["announcement"],
  { revalidate: 300 },
);

const PAGE_SIZE = 15;

function ListingsSkeleton() {
  return (
    <div className="space-y-3 px-4 pb-4 pt-6 sm:px-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="space-y-3 sm:hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
      <div className="hidden grid-cols-3 gap-4 sm:grid lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/3] w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

async function RecentListingsSection({ profileLocation }: { profileLocation?: ProfileLocation }) {
  const recent = await getRankedRecentListings({ profileLocation }, PAGE_SIZE);
  return (
    <section className="space-y-3 px-4 pb-4 pt-6 sm:px-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold lg:text-xl">{serverT("home.recentListings")}</h2>
        <Link href="/search" className="text-sm text-primary hover:underline">
          {serverT("home.seeAll")}
        </Link>
      </div>
      <RecentListings initial={recent} />
    </section>
  );
}

export async function HomeContent() {
  const [user, categories, announcement] = await Promise.all([
    getCurrentUser(),
    getCategories(),
    getAnnouncement(),
  ]);

  const locationLabel = user?.city ?? "Rwanda";
  const profileLocation: ProfileLocation | undefined = user
    ? { city: user.city, district: user.district, neighborhood: user.neighborhood }
    : undefined;

  return (
    <AppShell width="wide">
      <h1 className="sr-only">{serverT("nav.home")}</h1>

      <div className="lg:hidden">
        <LocationHeader location={locationLabel} />
      </div>

      {announcement?.active && announcement.text && (
        <div className="mx-4 mt-4 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-text-primary sm:mx-6">
          {announcement.text}
        </div>
      )}

      <CategoryBrowser categories={categories} title={serverT("home.browseCategories")} />

      <RecentlyViewed />

      <Suspense fallback={<ListingsSkeleton />}>
        <RecentListingsSection profileLocation={profileLocation} />
      </Suspense>
    </AppShell>
  );
}
