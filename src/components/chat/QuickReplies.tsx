"use client";

import { logger } from "@/lib/logger";

/** Conversion-boosting quick replies (verbatim from the spec). */
const QUICK_REPLIES = [
  "Is this available?",
  "Last price?",
  "Can we meet today?",
  "Why are you selling it?",
  "How long have you used it?",
];

export function QuickReplies({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto px-3 py-2">
      {QUICK_REPLIES.map((q) => (
        <button
          key={q}
          onClick={() => {
            logger.debug({ text: q }, "[QuickReplies] quick reply picked");
            onPick(q);
          }}
          className="shrink-0 rounded-pill border border-border bg-surface-card px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary"
        >
          {q}
        </button>
      ))}
    </div>
  );
}
