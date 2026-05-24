"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/store/useFavorites";
import { cn } from "@/lib/utils/cn";

export function FavoriteButton({ listingId, className }: { listingId: string; className?: string }) {
  const has = useFavorites((s) => s.ids.has(listingId));
  const toggle = useFavorites((s) => s.toggle);
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void toggle(listingId);
      }}
      aria-label={has ? "Remove from favorites" : "Save to favorites"}
      aria-pressed={has}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-pill bg-black/40 backdrop-blur",
        className,
      )}
    >
      <Heart
        size={18}
        className={has ? "fill-primary text-primary" : "text-text-primary"}
      />
    </button>
  );
}
