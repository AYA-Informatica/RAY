import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Clock, Circle } from "lucide-react";
import { timeAgo, isOnline, presenceLabel } from "@/lib/utils/format";
import type { SellerSummary } from "@/types";

/**
 * Seller identity block. MVP doesn't ship star ratings, but the spec's
 * "behavioral trust" layer is still expressed via signals derived from data
 * we already have:
 *   - account age ("On RAY since 2024")
 *   - activity volume ("12 listings")
 *   - presence ("Active now" / "Active 2 hours ago" — from lastSeenAt)
 *   - responsiveness ("Replies in ~5 min" — when chat service supplies it)
 *
 * The `verified` slot is reserved for a future ID-verification feature.
 */
export function SellerBadge({
  seller,
  verified = false,
}: {
  seller: SellerSummary;
  verified?: boolean;
}) {
  const online = isOnline(seller.lastSeenAt);
  const year = new Date(seller.createdAt).getFullYear();
  const listings = seller.listingsCount ?? 0;
  const response = formatResponseTime(seller.responseTimeMins);

  return (
    <Link href={`/user/${seller.id}`} className="flex items-center gap-3">
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-pill bg-surface-modal">
        {seller.avatarUrl ? (
          <Image src={seller.avatarUrl} alt={seller.name ?? "Seller"} fill className="object-cover" sizes="48px" />
        ) : (
          <span className="grid h-full w-full place-items-center font-display text-lg text-text-secondary">
            {(seller.name ?? "?").charAt(0).toUpperCase()}
          </span>
        )}
        {online && (
          <span
            aria-hidden
            className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-pill border-2 border-surface-card bg-success"
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 font-display font-bold text-text-primary">
          {seller.name ?? "RAY user"}
          {verified && (
            <span title="Verified" aria-label="Verified">
              <ShieldCheck size={16} className="text-success" />
            </span>
          )}
        </p>
        <p className="text-xs text-text-secondary">
          On RAY since {year} · {listings} {listings === 1 ? "listing" : "listings"}
        </p>
        {/* Behavioral trust row */}
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
          <span className={`flex items-center gap-1 ${online ? "text-success" : "text-text-secondary"}`}>
            <Circle size={8} className={online ? "fill-success text-success" : "fill-text-secondary text-text-secondary"} />
            {online ? "Active now" : presenceLabel(seller.lastSeenAt)}
          </span>
          {response && (
            <span className="flex items-center gap-1 text-text-secondary">
              <Clock size={11} /> {response}
            </span>
          )}
          {listings >= 5 && (
            <span className="text-text-secondary">· Posting {timeAgo(seller.createdAt)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

/** Render "Replies in ~5 min" / "~2 hours" / undefined for unknown. */
function formatResponseTime(mins?: number): string | null {
  if (mins == null || mins < 0) return null;
  if (mins < 60) return `Replies in ~${mins} min`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `Replies in ~${hours}h`;
  const days = Math.round(hours / 24);
  return `Replies in ~${days}d`;
}
