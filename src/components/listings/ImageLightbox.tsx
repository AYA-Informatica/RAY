"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X } from "lucide-react";

/** Fullscreen tap-to-zoom image viewer, opened from ListingGallery.
 *  Reuses Modal.tsx's escape-key + body-scroll-lock conventions without its
 *  bottom-sheet chrome — this is a solid-black fullscreen overlay instead. */
export function ImageLightbox({
  images,
  title,
  initialIndex,
  open,
  onClose,
}: {
  images: string[];
  title: string;
  initialIndex: number;
  open: boolean;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setMounted(false);
      return;
    }
    setMounted(true);
    document.body.style.overflow = "hidden";
    const rail = railRef.current;
    if (rail) {
      requestAnimationFrame(() => {
        rail.scrollTo({ left: initialIndex * rail.offsetWidth, behavior: "auto" });
      });
    }
    return () => {
      document.body.style.overflow = "";
    };
    // Only re-run when the lightbox opens, not on every initialIndex change
    // while it's already open (that would fight the user's own scrolling).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (typeof document === "undefined" || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] bg-black" role="dialog" aria-modal="true" aria-label={title}>
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 z-10 rounded-pill bg-black/50 p-2 text-white hover:bg-black/70"
      >
        <X size={22} />
      </button>
      <div ref={railRef} className="no-scrollbar flex h-full w-full snap-x snap-mandatory overflow-x-scroll">
        {images.map((src, i) => (
          <div key={src} className="relative h-full w-full shrink-0 snap-start">
            <Image
              src={src}
              alt={`${title} — photo ${i + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        ))}
      </div>
    </div>,
    document.body,
  );
}
