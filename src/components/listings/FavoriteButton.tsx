"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/store/useFavorites";
import { cn } from "@/lib/utils/cn";
import { logger } from "@/lib/logger";

export function FavoriteButton({ listingId, className }: { listingId: string; className?: string }) {
  const has = useFavorites((s) => s.ids.has(listingId));
  const toggle = useFavorites((s) => s.toggle);
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        logger.debug({ listingId, next: !has }, "[FavoriteButton] favorite toggled");
        void toggle(listingId);
      }}
      aria-label={has ? "Remove from favorites" : "Save to favorites"}
      aria-pressed={has}
      className={cn(
        "grid h-11 w-11 place-items-center rounded-pill bg-black/40 backdrop-blur transition-transform active:scale-[0.85]",
        className,
      )}
    >
      <Heart
        size={20}
        className={has ? "fill-primary text-primary" : "text-text-primary"}
      />
    </button>
  );
}
