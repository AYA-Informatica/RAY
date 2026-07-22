"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, CheckCircle2, RotateCcw, Loader2, Eye, RefreshCw, Mail } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PriceTag } from "./PriceTag";
import { useI18n } from "@/i18n/I18nProvider";
import { timeAgo } from "@/lib/utils/format";
import { STATUS_TONE, STATUS_KEY } from "@/lib/listings/status";
import type { ListingCardData } from "@/types";
import { logger } from "@/lib/logger";

export function MyAdCard({ listing }: { listing: ListingCardData }) {
  const router = useRouter();
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(listing.status);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isReposting, setIsReposting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function setListingStatus(next: "ACTIVE" | "SOLD") {
    // Optimistic update
    const prevStatus = status;
    setStatus(next);
    setBusy(true);
    logger.debug({ listingId: listing.id, next }, "[MyAdCard] status change requested");

    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error?.message || "Failed to update status");
      }
      logger.debug({ listingId: listing.id, next }, "[MyAdCard] status change succeeded");
    } catch (err) {
      logger.warn({ listingId: listing.id, next, err }, "[MyAdCard] status change failed");
      setStatus(prevStatus);
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setBusy(false);
    }
  }

  async function repost() {
    if (busy || isReposting) return; // Prevent double-click
    setIsReposting(true);
    setBusy(true);
    logger.debug({ listingId: listing.id }, "[MyAdCard] repost requested");
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repostFromId: listing.id }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        logger.warn({ listingId: listing.id, status: res.status }, "[MyAdCard] repost failed");
        setError(errorData.error?.message || t("common.error"));
        setIsReposting(false);
        setBusy(false);
        return;
      }

      const { data } = (await res.json()) as { data: { id: string } };
      logger.debug({ listingId: listing.id, newListingId: data.id }, "[MyAdCard] repost succeeded");
      // Navigate to new listing - keep busy state to prevent further clicks
      router.push(`/listing/${data.id}`);
    } catch (err) {
      logger.error({ listingId: listing.id, err }, "[MyAdCard] repost threw");
      setIsReposting(false);
      setBusy(false);
      setError(t("common.error"));
    }
  }

  async function remove() {
    if (!window.confirm(t("myAds.deleteConfirm"))) return;
    setBusy(true);
    logger.debug({ listingId: listing.id }, "[MyAdCard] delete requested");

    try {
      // Permanent delete - removes from database entirely
      const res = await fetch(`/api/listings/${listing.id}?permanent=true`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Failed to delete");

      logger.debug({ listingId: listing.id }, "[MyAdCard] delete succeeded");
      // Optimistic removal
      setIsDeleted(true);
    } catch (err) {
      logger.warn({ listingId: listing.id, err }, "[MyAdCard] delete failed");
      setBusy(false);
      setError(t("common.error"));
    }
  }

  // Hide if deleted
  if (isDeleted) return null;

  const isLoading = busy;

  return (
    <Card className="overflow-hidden">
      <div className="flex">
        <Link href={`/listing/${listing.id}`} className="relative aspect-square w-24 shrink-0 bg-surface-modal">
          {listing.coverImage ? (
            <Image src={listing.coverImage} alt={listing.title} fill className="object-cover" sizes="96px" />
          ) : (
            <span className="grid h-full w-full place-items-center text-2xl">{listing.category.icon}</span>
          )}
        </Link>
        <div className="min-w-0 flex-1 p-3">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/listing/${listing.id}`} className="line-clamp-1 font-medium text-text-primary">
              {listing.title}
            </Link>
            <Badge tone={STATUS_TONE[status] ?? "muted"}>{t(STATUS_KEY[status] ?? status)}</Badge>
          </div>
          <PriceTag amount={listing.price} size="sm" />
          <div className="mt-0.5 flex items-center gap-3 text-[11px] text-text-muted">
            <span suppressHydrationWarning>{timeAgo(listing.createdAt)}</span>
            <span className="flex items-center gap-0.5">
              <Eye size={11} /> {listing.views ?? 0} views
            </span>
          </div>
        </div>
      </div>

      {error && (
        <p className="border-t border-danger/20 bg-danger/10 px-3 py-1.5 text-xs text-danger">{error}</p>
      )}
      <div className="flex items-center gap-1 border-t border-border px-2 py-1.5">
        {status === "EXPIRED" || status === "REMOVED" ? (
          <button
            onClick={repost}
            disabled={isLoading || isReposting}
            className="flex items-center gap-1 rounded-sm px-2 py-1 text-xs text-primary hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading || isReposting ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            {isReposting ? "Reposting..." : "Repost"}
          </button>
        ) : status === "FLAGGED" ? (
          <a
            href={`mailto:support@raymarkets.co?subject=Flagged listing — ${encodeURIComponent(listing.title)}&body=Listing ID: ${listing.id}`}
            className="flex items-center gap-1 rounded-sm px-2 py-1 text-xs text-warning hover:bg-warning/10"
          >
            <Mail size={14} /> {t("myAds.contactSupport")}
          </a>
        ) : (
          <>
            <Link
              href={`/profile/ads/${listing.id}/edit`}
              className="flex items-center gap-1 rounded-sm px-2 py-1 text-xs text-text-secondary hover:text-text-primary"
            >
              <Pencil size={14} /> {t("common.edit")}
            </Link>
            {status === "SOLD" ? (
              <button
                onClick={() => setListingStatus("ACTIVE")}
                disabled={isLoading}
                className="flex items-center gap-1 rounded-sm px-2 py-1 text-xs text-success hover:bg-surface-modal disabled:opacity-50"
              >
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                {t("myAds.markActive")}
              </button>
            ) : (
              <button
                onClick={() => setListingStatus("SOLD")}
                disabled={isLoading}
                className="flex items-center gap-1 rounded-sm px-2 py-1 text-xs text-text-secondary hover:bg-surface-modal disabled:opacity-50"
              >
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                {t("myAds.markSold")}
              </button>
            )}
          </>
        )}
        <button
          onClick={remove}
          disabled={isLoading}
          className="ml-auto flex items-center gap-1 rounded-sm px-2 py-1 text-xs text-danger hover:bg-danger/10 disabled:opacity-50"
        >
          {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          {t("common.delete")}
        </button>
      </div>
    </Card>
  );
}
