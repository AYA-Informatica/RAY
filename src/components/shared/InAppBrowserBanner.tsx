"use client";

import { useEffect, useState } from "react";
import { logger } from "@/lib/logger";

/** Returns the name of the detected in-app browser, or null if not in one. */
function detectInAppBrowser(): string | null {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent;
  if (/FBAN|FBAV/.test(ua)) return "Facebook";
  if (/Instagram/.test(ua)) return "Instagram";
  if (/TikTok|BytedanceWebview/.test(ua)) return "TikTok";
  if (/Twitter|XCom/.test(ua)) return "Twitter";
  if (/MicroMessenger/i.test(ua)) return "WeChat";
  return null;
}

/**
 * Shows a banner when the user is inside an in-app browser (Facebook,
 * Instagram, TikTok, etc.) whose camera API is restricted.
 * Opens a native browser link so the user can access the camera properly.
 */
export function InAppBrowserBanner() {
  const [app, setApp] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const detected = detectInAppBrowser();
    if (detected) logger.debug({ app: detected }, "[InAppBrowserBanner] in-app browser detected");
    setApp(detected);
  }, []);

  if (!app || dismissed) return null;

  return (
    <div
      role="alert"
      className="relative z-[200] flex items-center justify-between gap-2 bg-warning px-4 py-2 text-sm font-medium text-black"
    >
      <span>
        {app} limits camera access.{" "}
        <a
          href={typeof window !== "undefined" ? window.location.href : "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold underline underline-offset-2"
        >
          Open in browser
        </a>{" "}
        for the best experience.
      </span>
      <button
        onClick={() => {
          logger.debug({ app }, "[InAppBrowserBanner] banner dismissed");
          setDismissed(true);
        }}
        aria-label="Dismiss"
        className="shrink-0 font-bold opacity-70 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}
