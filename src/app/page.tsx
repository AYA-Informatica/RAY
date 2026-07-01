import { Suspense } from "react";
import { HomeContent } from "./HomeContent";
import { SplashContent } from "./SplashContent";

export const metadata = { title: "RAY — Buy & Sell Anything Near You" };

/**
 * Root route — splash overlay on top of the home feed.
 *
 * Mobile / tablet:  splash is full-bleed orange (home not visible).
 * Desktop (≥ lg):   splash card floats over a semi-transparent scrim so the
 *                   home feed shows through behind it.
 *
 * HomeContent is wrapped in Suspense so the splash streams immediately
 * without waiting for HomeContent's DB queries to resolve. Without this,
 * the browser receives no HTML until all server queries complete, making
 * the page appear frozen for 2–5 s on cold start.
 */
export default function RootPage() {
  return (
    <div className="relative">
      {/* Suspense lets the splash stream instantly; feed fills in behind it */}
      <Suspense fallback={null}>
        <HomeContent />
      </Suspense>

      {/* Splash overlay — streams in the first HTML chunk, visible immediately */}
      <SplashContent />
    </div>
  );
}
