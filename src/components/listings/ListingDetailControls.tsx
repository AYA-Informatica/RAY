"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Share2 } from "lucide-react";

/**
 * Back + Share controls overlaid on the listing gallery.
 * Extracted as a client component so the detail page stays a server component.
 *  - Back: router.back() so coming from search returns to search, not hardcoded /home.
 *  - Share: Web Share API (mobile) with clipboard fallback (desktop).
 */
export function ListingDetailControls({
  listingId,
  title,
}: {
  listingId: string;
  title: string;
}) {
  const router = useRouter();

  async function share() {
    const url = `${window.location.origin}/listing/${listingId}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        /* user dismissed the share sheet — no-op */
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
      } catch { /* clipboard blocked */ }
    }
  }

  return (
    <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-3">
      <button
        onClick={() => router.back()}
        aria-label="Back"
        className="grid h-11 w-11 place-items-center rounded-pill bg-black/40 text-text-primary backdrop-blur transition-opacity hover:opacity-90"
      >
        <ArrowLeft size={20} />
      </button>
      <button
        onClick={() => void share()}
        aria-label="Share listing"
        className="grid h-11 w-11 place-items-center rounded-pill bg-black/40 text-text-primary backdrop-blur transition-opacity hover:opacity-90"
      >
        <Share2 size={18} />
      </button>
    </div>
  );
}
