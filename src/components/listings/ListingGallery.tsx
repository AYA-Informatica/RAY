"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";

/** Swipeable image gallery for the item detail page. */
export function ListingGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  if (images.length === 0) {
    return <div className="grid aspect-square w-full place-items-center bg-surface-modal text-5xl">📦</div>;
  }
  return (
    <div className="relative">
      <div className="relative aspect-square w-full bg-surface-modal">
        <Image
          src={images[active]!}
          alt={`${title} — photo ${active + 1}`}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 560px"
        />
      </div>
      {images.length > 1 && (
        <div className="no-scrollbar absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`View photo ${i + 1}`}
              className={cn(
                "h-1.5 rounded-pill transition-all",
                i === active ? "w-5 bg-primary" : "w-1.5 bg-text-primary/50",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
