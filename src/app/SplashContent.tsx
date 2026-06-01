"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

const VISITED_KEY = "ray_visited";

/**
 * Splash overlay — sits above the home feed via `fixed inset-0`.
 *
 * First-visit behaviour:
 *   Shows the splash. "Get Started" sets localStorage `ray_visited = 1` then
 *   navigates to /home. On every subsequent visit the overlay is skipped and
 *   the user lands directly on the home feed.
 *
 * Mobile / tablet (< lg):  full-bleed RAY orange.
 * Desktop (≥ lg):           semi-transparent scrim — home feed visible behind.
 */
export function SplashContent() {
  const { t } = useI18n();
  const router = useRouter();
  const [visible, setVisible] = useState(false); // hidden until we confirm first visit

  // Check localStorage on mount (client-only — avoids SSR mismatch).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(VISITED_KEY)) {
      // Returning visitor — skip the splash immediately.
      router.replace("/home");
    } else {
      // First visit — show it.
      setVisible(true);
    }
  }, [router]);

  function handleGetStarted() {
    localStorage.setItem(VISITED_KEY, "1");
    // Navigation handled by the <Link> href — this just persists the flag first.
  }

  // Render nothing until we've confirmed first-visit status (avoids flash).
  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center
                 bg-primary
                 lg:bg-black/60 lg:backdrop-blur-sm"
    >
      {/* Card — full-screen on mobile, floating pill on desktop */}
      <div
        className="flex w-full flex-col items-center justify-between
                   bg-primary px-6 py-16 text-text-primary
                   min-h-dvh
                   lg:min-h-0 lg:w-auto lg:min-w-[340px] lg:max-w-sm
                   lg:rounded-2xl lg:px-10 lg:py-16
                   lg:shadow-[0_32px_80px_rgba(0,0,0,0.7)]"
      >
        {/* Wordmark + tagline */}
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <h1 className="font-display text-7xl font-extrabold tracking-tight sm:text-8xl lg:text-7xl">
            RAY
          </h1>
          <p className="mt-1 font-sans text-lg font-medium opacity-95">
            {t("splash.tagline")}
          </p>
        </div>

        {/* CTA */}
        <Link
          href="/home"
          onClick={handleGetStarted}
          className="flex w-full max-w-xs items-center justify-center gap-2 rounded-pill
                     bg-text-primary/95 px-6 py-4
                     font-display text-lg font-bold text-primary
                     shadow-cta transition-transform active:scale-95 hover:bg-text-primary"
        >
          {t("splash.getStarted")} <ArrowRight size={20} />
        </Link>
      </div>

      {/* Desktop: clicking the scrim outside the card also enters */}
      <Link
        href="/home"
        onClick={handleGetStarted}
        className="absolute inset-0 -z-10 hidden lg:block"
        aria-label="Enter RAY"
        tabIndex={-1}
      />
    </div>
  );
}
