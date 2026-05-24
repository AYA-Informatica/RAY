import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { timeAgo } from "@/lib/utils/format";
import type { SellerSummary } from "@/types";

/**
 * Seller identity block. Per MVP: no ratings/verification yet — trust is shown
 * via account age + activity. Verified badge structure is ready for later.
 */
export function SellerBadge({
  seller,
  verified = false,
}: {
  seller: SellerSummary;
  verified?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-11 w-11 overflow-hidden rounded-pill bg-surface-modal">
        {seller.avatarUrl ? (
          <Image src={seller.avatarUrl} alt={seller.name ?? "Seller"} fill className="object-cover" />
        ) : (
          <span className="grid h-full w-full place-items-center font-display text-lg text-text-secondary">
            {(seller.name ?? "?").charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p className="flex items-center gap-1 font-display font-bold text-text-primary">
          {seller.name ?? "RAY user"}
          {verified && <ShieldCheck size={16} className="text-success" />}
        </p>
        <p className="text-xs text-text-secondary">
          On RAY since {new Date(seller.createdAt).getFullYear()} ·{" "}
          {seller.listingsCount ?? 0} listings · joined {timeAgo(seller.createdAt)}
        </p>
      </div>
    </div>
  );
}
