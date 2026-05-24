"use client";

import Link from "next/link";
import { MapPin, Bell, Heart } from "lucide-react";

/** Orange home header from the wireframe: location pill + bell + favorites. */
export function LocationHeader({ location = "Rwanda" }: { location?: string }) {
  return (
    <div className="bg-primary px-4 pb-5 pt-4">
      <div className="flex items-center justify-between text-text-primary">
        <div className="flex items-center gap-1.5">
          <MapPin size={20} />
          <span className="font-display text-lg font-bold">{location}</span>
        </div>
        <div className="flex items-center gap-4">
          <Bell size={22} />
          <Link href="/favorites" aria-label="Favorites">
            <Heart size={22} />
          </Link>
        </div>
      </div>
      <Link
        href="/search"
        className="mt-4 block rounded-md bg-text-primary/15 px-4 py-3 text-sm text-text-primary/80"
      >
        Search for items, brands, or categories…
      </Link>
    </div>
  );
}
