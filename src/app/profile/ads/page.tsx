import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { MyAdCard } from "@/components/listings/MyAdCard";
import { MyAdsHeader } from "./MyAdsHeader";
import { MyAdsEmpty } from "./MyAdsEmpty";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserListings } from "@/services/listings";

export const metadata = { title: "My Ads" };

/** Seller's own listings with management actions. Auth required. */
export default async function MyAdsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/profile/ads");

  const listings = await getUserListings(user.id);

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
