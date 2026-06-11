"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { ListingGrid } from "./ListingGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { useFavorites } from "@/store/useFavorites";
import type { ListingCardData } from "@/types";

/** Favorites grid that reacts to unfavoriting — removes the card immediately. */
export function FavoritesGrid({ listings }: { listings: ListingCardData[] }) {
  const ids = useFavorites((s) => s.ids);
  const ready = useFavorites((s) => s.ready);
  const visible = ready ? listings.filter((l) => ids.has(l.id)) : listings;

  if (visible.length === 0) {
    return (
      <EmptyState
        icon={<Heart size={36} />}
        title="No favourites yet"
        description="Tap the heart on any listing to save it here for later."
        action={
          <Link href="/search">
            <Button>Browse listings</Button>
          </Link>
        }
      />
    );
  }

  return <ListingGrid listings={visible} />;
}
