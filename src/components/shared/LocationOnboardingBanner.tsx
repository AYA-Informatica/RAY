"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, X } from "lucide-react";

const STORAGE_KEY = "ray:location-onboarding-dismissed";

/**
 * One-time prompt shown to signed-in users who haven't saved a location yet.
 * Dismissed via localStorage so it doesn't reappear after the user closes it.
 */
export function LocationOnboardingBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY);
      if (!dismissed) setVisible(true);
    } catch {}
  }, []);

  function dismiss() {
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="mx-4 mt-3 flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 sm:mx-6">
      <MapPin size={18} className="shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text-primary">Set your location for nearby listings</p>
        <p className="text-xs text-text-secondary">See what&apos;s selling near you first.</p>
      </div>
      <Link
        href="/profile/edit"
        onClick={dismiss}
        className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-text-primary hover:opacity-90"
      >
        Set location
      </Link>
      <button onClick={dismiss} aria-label="Dismiss" className="shrink-0 text-text-muted hover:text-text-primary">
        <X size={16} />
      </button>
    </div>
  );
}
