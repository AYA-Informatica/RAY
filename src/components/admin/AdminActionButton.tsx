"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";

type AdminAction =
  | { action: "removeListing"; listingId: string }
  | { action: "restoreListing"; listingId: string }
  | { action: "resolveReport"; reportId: string }
  | { action: "banUser"; userId: string }
  | { action: "unbanUser"; userId: string };

/** Fires a moderation action against /api/admin then refreshes the page. */
export function AdminActionButton({
  payload,
  label,
  tone = "default",
}: {
  payload: AdminAction;
  label: string;
  tone?: "default" | "danger" | "success";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try {
      await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={run}
      disabled={loading}
      className={cn(
        "rounded-sm px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50",
        tone === "danger" && "bg-danger/15 text-danger hover:bg-danger/25",
        tone === "success" && "bg-success/15 text-success hover:bg-success/25",
        tone === "default" && "bg-surface-modal text-text-secondary hover:text-text-primary",
      )}
    >
      {loading ? "…" : label}
    </button>
  );
}
