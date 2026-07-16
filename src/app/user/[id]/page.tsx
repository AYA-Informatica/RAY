import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { SellerBadge } from "@/components/listings/SellerBadge";
import { ListingGrid } from "@/components/listings/ListingGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { PackageOpen } from "lucide-react";
import { getPublicUserProfile } from "@/services/users";
import { getSellerActiveListings } from "@/services/listings";
import { serverT } from "@/i18n/server";
import { logger } from "@/lib/logger";

type Params = { params: Promise<{ id: string }> };

// Seller inventory changes often — show current listings on every visit.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const profile = await getPublicUserProfile(id);
  if (!profile) return { title: "Seller not found" };
  return { title: `${profile.name ?? "RAY seller"} — RAY` };
}

/** Public seller profile — no auth required. */
export default async function SellerProfilePage({ params }: Params) {
  const { id } = await params;
  logger.debug({ userId: id }, "[SellerProfilePage] rendering");

  const [profile, listings] = await Promise.all([
    getPublicUserProfile(id),
    getSellerActiveListings(id),
  ]);
  if (!profile) {
    logger.debug({ userId: id }, "[SellerProfilePage] not found");
    notFound();
  }

  return (
    <AppShell width="wide">
      <div className="space-y-5 p-4">
        <section className="rounded-md border border-border bg-surface-card p-4">
          <SellerBadge seller={profile} />
          {profile.bio && (
            <p className="mt-3 whitespace-pre-wrap text-sm text-text-secondary">{profile.bio}</p>
          )}
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg font-bold">
            {await serverT("sellerProfile.listingsTitle")}
          </h2>
          {listings.length === 0 ? (
            <EmptyState
              icon={<PackageOpen size={36} />}
              title={await serverT("sellerProfile.noListings")}
              description={await serverT("sellerProfile.noListingsSub")}
            />
          ) : (
            <ListingGrid listings={listings} />
          )}
        </section>
      </div>
    </AppShell>
  );
}
