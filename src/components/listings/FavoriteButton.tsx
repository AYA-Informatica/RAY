"use client";

import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useFavorites } from "@/store/useFavorites";
import { cn } from "@/lib/utils/cn";

/**
 * Heart toggle on listing cards/detail. Sized to a 44px tap target so it works
 * with thumb-driven scrolling on a phone. A short scale pulse on tap gives
 * tactile confirmation the toggle registered.
 */
export function FavoriteButton({ listingId, className }: { listingId: string; className?: string }) {
  const has = useFavorites((s) => s.ids.has(listingId));
  const toggle = useFavorites((s) => s.toggle);
  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void toggle(listingId);
      }}
      aria-label={has ? "Remove from favorites" : "Save to favorites"}
      aria-pressed={has}
      className={cn(
        "grid h-11 w-11 place-items-center rounded-pill bg-black/40 backdrop-blur",
        className,
      )}
    >
      <Heart
        size={20}
        className={has ? "fill-primary text-primary" : "text-text-primary"}
      />
    </motion.button>
  );
}
