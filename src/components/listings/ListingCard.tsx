"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PriceTag } from "./PriceTag";
import { FavoriteButton } from "./FavoriteButton";
import { useI18n } from "@/i18n/I18nProvider";
import { timeAgo, formatDistance } from "@/lib/utils/format";
import type { ListingCardData } from "@/types";

/** Grid card used on Home (search results) and the search page. */
export function ListingCard({ listing, priority, index = 0 }: { listing: ListingCardData; priority?: boolean; index?: number }) {
  const { t } = useI18n();
  const isRental = listing.category.slug === "rentals";
  return (
    <Link
      href={`/listing/${listing.id}`}
      className="block animate-fade-in-up"
      style={{ animationDelay: `${Math.min(index * 40, 320)}ms` }}
    >
      <Card className="overflow-hidden">
        <div className="relative aspect-[4/3] bg-surface-modal">
          {listing.coverImage ? (
            <Image
              src={listing.coverImage}
              alt={listing.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover"
              priority={priority}
              loading={priority ? undefined : "lazy"}
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-3xl">
              {listing.category.icon}
            </div>
          )}
          {listing.featured && (
            <Badge tone="primary" className="absolute left-2 top-2 bg-primary text-text-primary">
              {t("common.featured")}
            </Badge>
          )}
          <FavoriteButton listingId={listing.id} className="absolute right-2 top-2" />
        </div>
        <div className="space-y-1 p-3">
          <h3 className="line-clamp-2 min-h-10 text-sm font-medium text-text-primary">{listing.title}</h3>
          <PriceTag amount={listing.price} size="sm" suffix={isRental ? "/mo" : undefined} />
          <div className="flex items-center justify-between gap-1 pt-1 text-[11px] text-text-secondary">
            <span className="flex min-w-0 items-center gap-0.5">
              <MapPin size={12} className="shrink-0" />
              <span className="truncate">
                {listing.neighborhood ?? listing.district}, {listing.city}
              </span>
            </span>
            <span className="shrink-0 text-right">
              {timeAgo(listing.createdAt)}
              {listing.distanceKm != null && ` · ${formatDistance(listing.distanceKm)}`}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

/** Wide horizontal card used in the "Recent Listings" home rail. */
export function ListingRow({ listing, priority }: { listing: ListingCardData; priority?: boolean }) {
  const isRental = listing.category.slug === "rentals";
  return (
    <Link href={`/listing/${listing.id}`} className="block">
      <Card className="flex items-stretch overflow-hidden">
        <div className="relative aspect-square w-28 shrink-0 bg-surface-modal">
          {listing.coverImage ? (
            <Image
              src={listing.coverImage}
              alt={listing.title}
              fill
              className="object-cover"
              sizes="112px"
              priority={priority}
              loading={priority ? undefined : "lazy"}
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-2xl">{listing.category.icon}</div>
          )}
        </div>
        <div className="flex flex-1 flex-col justify-center gap-1 p-3">
          <h3 className="line-clamp-1 font-medium text-text-primary">{listing.title}</h3>
          <PriceTag amount={listing.price} size="sm" suffix={isRental ? "/mo" : undefined} />
          <div className="flex items-center justify-between text-[11px] text-text-secondary">
            <span className="flex items-center gap-0.5">
              <MapPin size={12} /> {listing.neighborhood ?? listing.district}, {listing.city}
            </span>
            <span className="shrink-0">
              {timeAgo(listing.createdAt)}
              {listing.distanceKm != null && ` · ${formatDistance(listing.distanceKm)}`}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
