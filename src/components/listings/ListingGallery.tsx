"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";

/** Swipeable image gallery for the item detail page.
 *  Uses CSS scroll-snap so touch swipe, mouse drag, and keyboard all work natively.
 *  All images are rendered at once so swiping is instant — no loading between frames. */
export function ListingGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const railRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const scrollStartX = useRef(0);

  const scrollTo = useCallback((i: number) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollTo({ left: i * rail.offsetWidth, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const onScroll = () => {
      const i = Math.round(rail.scrollLeft / rail.offsetWidth);
      setActive(Math.min(Math.max(i, 0), images.length - 1));
    };
    rail.addEventListener("scroll", onScroll, { passive: true });
    return () => rail.removeEventListener("scroll", onScroll);
  }, [images.length]);

  if (images.length === 0) {
    return (
      <div className="grid aspect-square w-full place-items-center bg-surface-modal text-5xl">
        📦
      </div>
    );
  }

  return (
    <div className="relative select-none">
      {/* Scrollable rail — touch swipe native; mouse drag via pointer events */}
      <div
        ref={railRef}
        className="no-scrollbar flex aspect-square w-full snap-x snap-mandatory overflow-x-scroll cursor-grab active:cursor-grabbing"
        onPointerDown={(e) => {
          isDragging.current = true;
          dragStartX.current = e.clientX;
          scrollStartX.current = railRef.current?.scrollLeft ?? 0;
          // Suspend scroll-snap while dragging — otherwise the browser snaps
          // scrollLeft back to the nearest image on every pointermove,
          // making the drag feel stuck instead of following the cursor.
          if (railRef.current) railRef.current.style.scrollSnapType = "none";
          railRef.current?.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!isDragging.current || !railRef.current) return;
          railRef.current.scrollLeft = scrollStartX.current + (dragStartX.current - e.clientX);
        }}
        onPointerUp={() => {
          isDragging.current = false;
          const rail = railRef.current;
          if (!rail) return;
          rail.style.scrollSnapType = "";
          const i = Math.round(rail.scrollLeft / rail.offsetWidth);
          scrollTo(Math.min(Math.max(i, 0), images.length - 1));
        }}
        onPointerCancel={() => {
          isDragging.current = false;
          if (railRef.current) railRef.current.style.scrollSnapType = "";
        }}
      >
        {images.map((src, i) => (
          <div
            key={src}
            className="relative aspect-square w-full shrink-0 snap-start bg-surface-modal"
          >
            <Image
              src={src}
              alt={`${title} — photo ${i + 1}`}
              fill
              priority={i === 0}
              loading={i === 0 ? "eager" : "lazy"}
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 560px"
            />
          </div>
        ))}
      </div>

      {/* Dot indicators — clicking scrolls to that frame */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              aria-label={`View photo ${i + 1}`}
              className={cn(
                "h-1.5 rounded-pill transition-all duration-200",
                i === active ? "w-5 bg-primary" : "w-1.5 bg-text-primary/50",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
