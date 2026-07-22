import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ListingDetailControls } from "@/components/listings/ListingDetailControls";
import { ListingGallery } from "@/components/listings/ListingGallery";
import { PriceTag } from "@/components/listings/PriceTag";
import { FavoriteButton } from "@/components/listings/FavoriteButton";
import { SellerBadge } from "@/components/listings/SellerBadge";
import { ReportButton } from "@/components/listings/ReportButton";
import { ListingOwnerToolbar } from "@/components/listings/ListingOwnerToolbar";
import { RecordView } from "@/components/listings/RecordView";
import { Badge } from "@/components/ui/Badge";
import { STATUS_KEY, STATUS_BANNER_CLASS } from "@/lib/listings/status";
import { cn } from "@/lib/utils/cn";
import { ChatCtaBar } from "@/components/chat/ChatCtaBar";
import { getListing } from "@/services/listings";
import { SimilarListings } from "@/components/listings/SimilarListings";
import { formatPrice, timeAgo } from "@/lib/utils/format";
import { serverT } from "@/i18n/server";
import { MapPin, Eye } from "lucide-react";
import { FavoritesProvider } from "@/components/shared/FavoritesProvider";
import { getAuthUser } from "@/lib/auth/session";
import { getFavoriteIds } from "@/services/favorites";
import { logger } from "@/lib/logger";

type Params = { params: Promise<{ id: string }> };

// Disable static rendering for listing details to show real-time status
export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Per-listing SEO metadata + Open Graph (Build Prompt SEO requirements). */
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) {
    logger.debug({ listingId: id }, "[ListingDetailPage] generateMetadata: listing not found");
    return { title: "Listing not found" };
  }
  const cover = listing.images[0]?.url;
  return {
    title: listing.title,
    description: `${listing.title} — ${formatPrice(listing.price)} in ${listing.city}. ${listing.description.slice(0, 140)}`,
    alternates: { canonical: `/listing/${listing.id}` },
    openGraph: {
      title: listing.title,
      description: `${formatPrice(listing.price)} · ${listing.district}, ${listing.city}`,
      images: cover ? [{ url: cover }] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: listing.title,
      description: `${formatPrice(listing.price)} · ${listing.district}, ${listing.city}`,
      images: cover ? [cover] : undefined,
    },
  };
}

export default async function ListingDetailPage({ params }: Params) {
  const { id } = await params;
  logger.debug({ listingId: id }, "[ListingDetailPage] rendering");
  const [listing, authUser] = await Promise.all([getListing(id), getAuthUser()]);
  if (!listing) {
    logger.debug({ listingId: id }, "[ListingDetailPage] listing not found");
    notFound();
  }
  const favoriteIds = authUser ? await getFavoriteIds(authUser.id) : [];

  const isRental = listing.category.slug === "rentals";
  const isOwner = authUser?.id === listing.userId;

  // Structured data for rich search results.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description: listing.description,
    image: listing.images.map((i) => i.url),
    offers: {
      "@type": "Offer",
      price: listing.price,
      priceCurrency: "RWF",
      availability: listing.status === "ACTIVE" ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
    },
  };

  return (
    <div className="min-h-dvh bg-background pb-24 lg:pb-12">
      <FavoritesProvider initialIds={favoriteIds} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026") }} />
      <RecordView item={{ id: listing.id, title: listing.title, price: listing.price, coverImage: listing.images[0]?.url ?? null, city: listing.city }} />

      <div className="mx-auto w-full max-w-6xl lg:px-8 lg:py-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Gallery with overlaid back + share controls */}
          <div className="relative lg:self-start lg:overflow-hidden lg:rounded-xl">
            <ListingDetailControls listingId={listing.id} title={listing.title} />
            <div className="absolute right-3 top-3 z-10">
              <FavoriteButton listingId={listing.id} />
            </div>
            <ListingGallery images={listing.images.map((i) => i.url)} title={listing.title} />
          </div>

          {/* Details */}
          <div className="space-y-5 p-4 lg:p-0">
            {listing.status !== "ACTIVE" && (
              <div
                className={cn(
                  "rounded-md border p-3 text-center text-sm font-medium",
                  STATUS_BANNER_CLASS[listing.status],
                )}
              >
                <span className="font-display font-bold uppercase tracking-wide">
                  {await serverT(STATUS_KEY[listing.status] ?? listing.status)}
                </span>
                {" — "}
                {await serverT("listing.noLongerAvailable")}
              </div>
            )}

            <div>
              <h1 className="font-display text-2xl font-bold leading-tight lg:text-3xl">{listing.title}</h1>
              <PriceTag amount={listing.price} size="lg" suffix={isRental ? "/mo" : undefined} className="mt-1" />

              {/* Row 1 — qualifiers */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge tone="muted">{await serverT(`condition.${listing.condition}`)}</Badge>
                {listing.negotiable && <Badge tone="success">{await serverT("common.negotiable")}</Badge>}
              </div>

              {/* Row 2 — location · views · time (de-emphasized) */}
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-secondary">
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {listing.neighborhood ? `${listing.neighborhood}, ` : ""}
                  {listing.district}, {listing.city}
                </span>
                <span className="flex items-center gap-1">
                  <Eye size={12} /> {listing.views} {await serverT("listing.views")}
                </span>
                <span>· {timeAgo(listing.createdAt)}</span>
              </div>
            </div>

            {/* Dynamic category attributes */}
            {listing.attributeValues.length > 0 && (
              <section>
                <h2 className="mb-2 font-display font-bold">{await serverT("listing.details")}</h2>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-md border border-border bg-surface-card p-3">
                  {listing.attributeValues.map((av) =>
                    av.attribute ? (
                      <div key={av.id} className="flex flex-col">
                        <dt className="text-xs text-text-muted">{av.attribute.label}</dt>
                        <dd className="text-sm font-medium text-text-primary">{av.value}</dd>
                      </div>
                    ) : null,
                  )}
                </dl>
              </section>
            )}

            {/* Description */}
            <section>
              <h2 className="mb-2 font-display font-bold">{await serverT("listing.description")}</h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
                {listing.description}
              </p>
            </section>

            {/* Seller */}
            <section className="rounded-md border border-border bg-surface-card p-4">
              <SellerBadge seller={listing.user} />
            </section>

            {isOwner && (
              <ListingOwnerToolbar listingId={listing.id} initialStatus={listing.status} />
            )}

            {/* Safety note + report */}
            <div className="flex items-center justify-between rounded-md bg-surface-card/50 px-3 py-2">
              <p className="text-xs text-text-muted">{await serverT("listing.safetyNote")}</p>
              <ReportButton listingId={listing.id} />
            </div>

            {/* Desktop: in-flow CTA (mobile uses the sticky bar below) */}
            {!isOwner && (
              <div className="hidden lg:block">
                <ChatCtaBar listingId={listing.id} sellerName={listing.user.name ?? await serverT("common.theSeller")} inline />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Similar listings carousel */}
      <SimilarListings categoryId={listing.categoryId} excludeId={listing.id} />

      {/* Mobile/tablet sticky chat CTA */}
      {!isOwner && (
        <ChatCtaBar listingId={listing.id} sellerName={listing.user.name ?? await serverT("common.theSeller")} />
      )}
    </div>
  );
}
