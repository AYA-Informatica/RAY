"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

const STORAGE_KEY = "ray:announcement-dismissed";

export function AnnouncementBanner({ text }: { text: string }) {
  const [visible, setVisible] = useState(false);

  // Read localStorage after mount to avoid SSR hydration mismatch.
  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed !== text) setVisible(true);
  }, [text]);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, text);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="mx-4 mt-4 flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-text-primary sm:mx-6">
      <span className="flex-1">{text}</span>
      <button
        onClick={dismiss}
        aria-label="Dismiss announcement"
        className="mt-0.5 shrink-0 text-text-secondary hover:text-text-primary"
      >
        <X size={16} />
      </button>
    </div>
  );
}
