"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, CheckCircle2, RotateCcw, Loader2 } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { logger } from "@/lib/logger";
import type { ListingStatus } from "@/types";

/**
 * Owner-only edit + mark-sold controls shown inline on the listing detail
 * page. Delete/repost stay exclusive to My Ads. Mirrors MyAdCard's
 * optimistic status-toggle pattern (src/components/listings/MyAdCard.tsx).
 */
export function ListingOwnerToolbar({
  listingId,
  initialStatus,
}: {
  listingId: string;
  initialStatus: ListingStatus;
}) {
  const { t } = useI18n();
  const [status, setStatus] = useState(initialStatus);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggleSold() {
    const next = status === "SOLD" ? "ACTIVE" : "SOLD";
    const prev = status;
    setStatus(next);
    setBusy(true);
    setError(null);
    logger.debug({ listingId, next }, "[ListingOwnerToolbar] status change requested");
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      logger.debug({ listingId, next }, "[ListingOwnerToolbar] status change succeeded");
    } catch (err) {
      logger.warn({ listingId, next, err }, "[ListingOwnerToolbar] status change failed");
      setStatus(prev);
      setError(t("common.error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-surface-card p-2">
      <Link
        href={`/profile/ads/${listingId}/edit`}
        className="flex flex-1 items-center justify-center gap-1.5 rounded-sm px-3 py-2 text-sm text-text-secondary hover:bg-surface-modal hover:text-text-primary"
      >
        <Pencil size={15} /> {t("common.edit")}
      </Link>
      {(status === "ACTIVE" || status === "SOLD") && (
        <button
          onClick={toggleSold}
          disabled={busy}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-sm px-3 py-2 text-sm text-success hover:bg-surface-modal disabled:opacity-50"
        >
          {busy ? (
            <Loader2 size={15} className="animate-spin" />
          ) : status === "SOLD" ? (
            <RotateCcw size={15} />
          ) : (
            <CheckCircle2 size={15} />
          )}
          {status === "SOLD" ? t("myAds.markActive") : t("myAds.markSold")}
        </button>
      )}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
