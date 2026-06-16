"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";

type AdminAction =
  | { action: "removeListing"; listingId: string }
  | { action: "restoreListing"; listingId: string }
  | { action: "resolveReport"; reportId: string; outcome: "no_action" }
  | { action: "banUser"; userId: string }
  | { action: "unbanUser"; userId: string };

type Tone = "default" | "danger" | "success";

interface Props {
  payload: AdminAction;
  label: string;
  tone?: Tone;
  confirm?: string;          // optional confirmation prompt before firing
  onDone?: (success: boolean, label: string) => void;
}

/**
 * Fires a moderation action against /api/admin, shows inline feedback,
 * then refreshes the server data.
 *
 * `onDone` is called after the request completes so the parent can display
 * a toast (success message or error).
 */
export function AdminActionButton({ payload, label, tone = "default", confirm, onDone }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function run() {
    if (confirm && !window.confirm(confirm)) return;
    setLoading(true);
    try {
      // resolveReport needs the outcome field stripped before sending to API
      // (the API only knows resolveReport + reportId).
      const body: Record<string, string> =
        payload.action === "resolveReport"
          ? { action: payload.action, reportId: payload.reportId }
          : { ...payload };

      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const success = res.ok;
      onDone?.(success, label);
      if (success) router.refresh();
    } catch {
      onDone?.(false, label);
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
        tone === "danger"  && "bg-danger/15 text-danger hover:bg-danger/25",
        tone === "success" && "bg-success/15 text-success hover:bg-success/25",
        tone === "default" && "bg-surface-modal text-text-secondary hover:text-text-primary",
      )}
    >
      {loading ? "…" : label}
    </button>
  );
}
