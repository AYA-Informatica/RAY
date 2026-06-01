import { HomeContent } from "./HomeContent";
import { SplashContent } from "./SplashContent";

export const metadata = { title: "RAY — Buy & Sell Anything Near You" };

/**
 * Root route — renders the home feed as the background layer, with the splash
 * overlay on top.
 *
 * Mobile / tablet:  splash is full-bleed orange (covers everything, no home visible).
 * Desktop (≥ lg):   splash card floats over a semi-transparent scrim so the home
 *                   content shows through behind it — the user sees where they're
 *                   going before they tap "Get Started".
 *
 * Once the user taps "Get Started" they navigate to /home (standard page load,
 * no overlay). The overlay only appears on the very first entry.
 */
export default function RootPage() {
  return (
    <div className="relative">
      {/* Home feed — visible on desktop through the translucent scrim */}
      <HomeContent />

      {/* Splash overlay */}
      <SplashContent />
    </div>
  );
}
