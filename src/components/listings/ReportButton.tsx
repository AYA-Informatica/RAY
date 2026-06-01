"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

const REASONS = [
  { value: "SPAM", label: "Spam" },
  { value: "FAKE", label: "Fake listing" },
  { value: "STOLEN", label: "Stolen item" },
  { value: "SCAM", label: "Scam" },
  { value: "HARASSMENT", label: "Harassment" },
  { value: "INAPPROPRIATE", label: "Inappropriate" },
];

/** One-tap report (Safety UX). Files to /api/reports — does NOT auto-remove. */
export function ReportButton({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("SPAM");
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");

  async function submit() {
    setStatus("sending");
    try {
      await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, details, listingId }),
      });
      setStatus("done");
    } catch {
      setStatus("idle");
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-xs text-text-muted hover:text-danger"
      >
        <Flag size={13} /> Report
      </button>
      <Modal open={open} onClose={() => { setOpen(false); if (status === "done") setStatus("idle"); }} title="Report listing">
        {status === "done" ? (
          <div className="space-y-4 py-2 text-center">
            <p className="text-2xl">✅</p>
            <p className="font-display font-bold">Report received</p>
            <p className="text-sm text-text-secondary">
              Our moderation team will review this listing. Thank you for keeping RAY safe.
            </p>
            <button
              onClick={() => { setOpen(false); setStatus("idle"); setDetails(""); }}
              className="w-full rounded-md bg-surface-card py-2.5 text-sm font-medium text-text-primary hover:bg-surface-modal"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <Select
              label="Reason"
              options={REASONS}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <Textarea
              label="Details (optional)"
              placeholder="What's wrong with this listing?"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
            <Button fullWidth loading={status === "sending"} onClick={submit} variant="danger">
              Submit report
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
}
