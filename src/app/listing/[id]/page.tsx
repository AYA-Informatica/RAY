import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, MapPin, Eye, Share2 } from "lucide-react";
import { ListingGallery } from "@/components/listings/ListingGallery";
import { PriceTag } from "@/components/listings/PriceTag";
import { FavoriteButton } from "@/components/listings/FavoriteButton";
import { SellerBadge } from "@/components/listings/SellerBadge";
import { ReportButton } from "@/components/listings/ReportButton";
import { Badge } from "@/components/ui/Badge";
import { ChatCtaBar } from "@/components/chat/ChatCtaBar";
import { getListing } from "@/services/listings";
import { formatPrice, timeAgo, conditionLabel } from "@/lib/utils/format";

type Params = { params: { id: string } };

/** Per-listing SEO metadata + Open Graph (Build Prompt SEO requirements). */
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const listing = await getListing(params.id);
  if (!listing) return { title: "Listing not found" };
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
  };
}

export default async function ListingDetailPage({ params }: Params) {
  const listing = await getListing(params.id);
  if (!listing) notFound();

  const isRental = listing.category.slug === "rentals";

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
    <div className="mx-auto min-h-dvh max-w-md bg-background pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Top bar overlaid on gallery */}
      <div className="relative">
        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-3">
          <Link
            href="/home"
            className="grid h-9 w-9 place-items-center rounded-pill bg-black/40 text-text-primary backdrop-blur"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <button className="grid h-9 w-9 place-items-center rounded-pill bg-black/40 text-text-primary backdrop-blur" aria-label="Share">
              <Share2 size={18} />
            </button>
            <FavoriteButton listingId={listing.id} className="h-9 w-9" />
          </div>
        </div>
        <ListingGallery images={listing.images.map((i) => i.url)} title={listing.title} />
      </div>

      <div className="space-y-5 p-4">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-display text-2xl font-bold leading-tight">{listing.title}</h1>
          </div>
          <PriceTag amount={listing.price} size="lg" suffix={isRental ? "/mo" : undefined} className="mt-1" />
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-text-secondary">
            <Badge tone="muted">{conditionLabel(listing.condition)}</Badge>
            {listing.negotiable && <Badge tone="success">Negotiable</Badge>}
            <span className="flex items-center gap-1">
              <MapPin size={14} /> {listing.neighborhood ? `${listing.neighborhood}, ` : ""}
              {listing.district}, {listing.city}
            </span>
            <span className="flex items-center gap-1 text-text-muted">
              <Eye size={14} /> {listing.views} views · {timeAgo(listing.createdAt)}
            </span>
          </div>
        </div>

        {/* Dynamic category attributes */}
        {listing.attributeValues.length > 0 && (
          <section>
            <h2 className="mb-2 font-display font-bold">Details</h2>
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
          <h2 className="mb-2 font-display font-bold">Description</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
            {listing.description}
          </p>
        </section>

        {/* Seller */}
        <section className="rounded-md border border-border bg-surface-card p-4">
          <SellerBadge seller={listing.user} />
        </section>

        {/* Safety note + report */}
        <div className="flex items-center justify-between rounded-md bg-surface-card/50 px-3 py-2">
          <p className="text-xs text-text-muted">Meet in a public place. Never pay before seeing the item.</p>
          <ReportButton listingId={listing.id} />
        </div>
      </div>

      {/* Sticky chat CTA */}
      <ChatCtaBar listingId={listing.id} sellerName={listing.user.name ?? "the seller"} />
    </div>
  );
}
