import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { MyAdCard } from "@/components/listings/MyAdCard";
import { MyAdsHeader } from "./MyAdsHeader";
import { MyAdsEmpty } from "./MyAdsEmpty";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserListings } from "@/services/listings";
import { logger } from "@/lib/logger";

export const metadata = { title: "My Ads" };

// Force dynamic rendering - disable static optimization and caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Seller's own listings with management actions. Auth required. */
export default async function MyAdsPage() {
  logger.debug("[MyAdsPage] rendering");
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/profile/ads");

  const listings = await getUserListings(user.id);
  logger.debug({ count: listings.length }, "[MyAdsPage] listings loaded");

  return (
    <AppShell>
      <MyAdsHeader />
      <div className="space-y-3 p-4">
        {listings.length === 0 ? (
          <MyAdsEmpty />
        ) : (
          listings.map((l) => <MyAdCard key={l.id} listing={l} />)
        )}
      </div>
    </AppShell>
  );
}
