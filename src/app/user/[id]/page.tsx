import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { SellerBadge } from "@/components/listings/SellerBadge";
import { ListingGrid } from "@/components/listings/ListingGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { PackageOpen, Tag, CalendarDays, MessageCircle } from "lucide-react";
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

  const memberYear = new Date(profile.createdAt).getFullYear();
  const listingsCount = profile.listingsCount ?? 0;
  const responseMins = profile.responseTimeMins;

  return (
    <AppShell width="wide">
      <div className="space-y-5 p-4">
        <section className="rounded-md border border-border bg-surface-card p-4">
          <SellerBadge seller={profile} />
          {profile.bio && (
            <p className="mt-3 whitespace-pre-wrap text-sm text-text-secondary">{profile.bio}</p>
          )}

          {/* Stats card */}
          <div className="mt-4 grid grid-cols-3 divide-x divide-border rounded-lg border border-border bg-background">
            <div className="flex flex-col items-center gap-1 py-3">
              <Tag size={16} className="text-text-muted" />
              <span className="text-lg font-bold text-text-primary">{listingsCount}</span>
              <span className="text-[11px] text-text-muted">{await serverT("sellerProfile.listingsLabel")}</span>
            </div>
            <div className="flex flex-col items-center gap-1 py-3">
              <CalendarDays size={16} className="text-text-muted" />
              <span className="text-lg font-bold text-text-primary">{memberYear}</span>
              <span className="text-[11px] text-text-muted">{await serverT("sellerProfile.memberSince")}</span>
            </div>
            <div className="flex flex-col items-center gap-1 py-3">
              <MessageCircle size={16} className="text-text-muted" />
              <span className="text-lg font-bold text-text-primary">
                {responseMins == null ? "—" : responseMins < 60 ? `${responseMins}m` : `${Math.round(responseMins / 60)}h`}
              </span>
              <span className="text-[11px] text-text-muted">{await serverT("sellerProfile.responseTime")}</span>
            </div>
          </div>
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
