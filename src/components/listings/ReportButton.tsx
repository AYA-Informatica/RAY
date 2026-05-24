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
      <Modal open={open} onClose={() => setOpen(false)} title="Report listing">
        {status === "done" ? (
          <p className="py-4 text-center text-sm text-text-secondary">
            Thanks — our moderation team will review this.
          </p>
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
