import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ProfileMenu } from "@/components/profile/ProfileMenu";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export const metadata = { title: "My Account" };

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

/** My Account — fetches stats, delegates UI to the translated ProfileMenu. */
export default async function ProfilePage() {
  logger.debug("[ProfilePage] rendering");
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/profile");

  let activeAds = 0;
  let totalViews = 0;
  let favourites = 0;
  try {
    const [ads, views, favs] = await Promise.all([
      prisma.listing.count({ where: { userId: user.id, status: "ACTIVE" } }),
      prisma.listing.aggregate({ where: { userId: user.id }, _sum: { views: true } }),
      prisma.favorite.count({ where: { userId: user.id } }),
    ]);
    activeAds = ads;
    totalViews = views._sum.views ?? 0;
    favourites = favs;
  } catch (err) {
    logger.warn({ userId: user.id, message: err instanceof Error ? err.message : String(err) }, "[ProfilePage] stats fetch failed, falling back to zeros");
  }

  return (
    <AppShell>
      <ProfileMenu
        name={user.name ?? "RAY user"}
        email={user.email}
        avatarUrl={user.avatarUrl ?? null}
        activeAds={activeAds}
        totalViews={formatCount(totalViews)}
        favourites={favourites}
      />
    </AppShell>
  );
}
