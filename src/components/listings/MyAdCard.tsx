"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, CheckCircle2, RotateCcw, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PriceTag } from "./PriceTag";
import { useI18n } from "@/i18n/I18nProvider";
import { timeAgo } from "@/lib/utils/format";
import type { ListingCardData } from "@/types";

const STATUS_TONE: Record<string, "success" | "warning" | "danger" | "muted" | "navy"> = {
  ACTIVE: "success",
  SOLD: "navy",
  EXPIRED: "muted",
  REMOVED: "danger",
  FLAGGED: "warning",
};

const STATUS_KEY: Record<string, string> = {
  ACTIVE: "myAds.status.active",
  SOLD: "myAds.status.sold",
  EXPIRED: "myAds.status.expired",
  REMOVED: "myAds.status.removed",
  FLAGGED: "myAds.status.flagged",
};

/** A seller's own listing with management actions (edit, mark sold, delete). */
export function MyAdCard({ listing }: { listing: ListingCardData }) {
  const router = useRouter();
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(listing.status);

  async function setListingStatus(next: "ACTIVE" | "SOLD") {
    setBusy(true);
    setStatus(next); // optimistic
    try {
      await fetch(`/api/listings/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      router.refresh();
    } catch {
      setStatus(listing.status);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm(t("myAds.deleteConfirm"))) return;
    setBusy(true);
    try {
      await fetch(`/api/listings/${listing.id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const tone = STATUS_TONE[status] ?? "muted";

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
            <Badge tone={tone}>{t(STATUS_KEY[status] ?? status)}</Badge>
          </div>
          <PriceTag amount={listing.price} size="sm" />
          <p className="text-[11px] text-text-muted">{timeAgo(listing.createdAt)}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 border-t border-border px-2 py-1.5">
        <Link
          href={`/profile/ads/${listing.id}/edit`}
          className="flex items-center gap-1 rounded-sm px-2 py-1 text-xs text-text-secondary hover:text-text-primary"
        >
          <Pencil size={14} /> {t("common.edit")}
        </Link>

        {status === "SOLD" ? (
          <button
            onClick={() => setListingStatus("ACTIVE")}
            disabled={busy}
            className="flex items-center gap-1 rounded-sm px-2 py-1 text-xs text-success hover:bg-surface-modal disabled:opacity-50"
          >
            <RotateCcw size={14} /> {t("myAds.markActive")}
          </button>
        ) : (
          <button
            onClick={() => setListingStatus("SOLD")}
            disabled={busy}
            className="flex items-center gap-1 rounded-sm px-2 py-1 text-xs text-text-secondary hover:bg-surface-modal disabled:opacity-50"
          >
            <CheckCircle2 size={14} /> {t("myAds.markSold")}
          </button>
        )}

        <button
          onClick={remove}
          disabled={busy}
          className="ml-auto flex items-center gap-1 rounded-sm px-2 py-1 text-xs text-danger hover:bg-danger/10 disabled:opacity-50"
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          {t("common.delete")}
        </button>
      </div>
    </Card>
  );
}
