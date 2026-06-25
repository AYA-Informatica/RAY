"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useI18n } from "@/i18n/I18nProvider";

/** One-tap report (Safety UX). Files to /api/reports — does NOT auto-remove. */
export function ReportButton({ listingId }: { listingId: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("SPAM");
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");

  const reasons = [
    { value: "SPAM", label: t("report.reasonSpam") },
    { value: "FAKE", label: t("report.reasonFake") },
    { value: "STOLEN", label: t("report.reasonStolen") },
    { value: "SCAM", label: t("report.reasonScam") },
    { value: "HARASSMENT", label: t("report.reasonHarassment") },
    { value: "INAPPROPRIATE", label: t("report.reasonInappropriate") },
  ];

  async function submit() {
    setStatus("sending");
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, details, listingId }),
      });
      if (res.status === 401) {
        window.location.href = `/login?redirect=/listing/${listingId}`;
        return;
      }
      if (!res.ok) throw new Error("Report failed");
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
        <Flag size={13} /> {t("listing.report")}
      </button>
      <Modal open={open} onClose={() => { setOpen(false); if (status === "done") setStatus("idle"); }} title={t("report.title")}>
        {status === "done" ? (
          <div className="space-y-4 py-2 text-center">
            <p className="text-2xl">✅</p>
            <p className="font-display font-bold">{t("report.received")}</p>
            <p className="text-sm text-text-secondary">{t("report.receivedBody")}</p>
            <button
              onClick={() => { setOpen(false); setStatus("idle"); setDetails(""); }}
              className="w-full rounded-md bg-surface-card py-2.5 text-sm font-medium text-text-primary hover:bg-surface-modal"
            >
              {t("common.close")}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <Select
              label={t("report.reasonSpam").replace(/.*/, "Reason")}
              options={reasons}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <Textarea
              label={t("report.detailsPlaceholder")}
              placeholder={t("report.detailsPlaceholder")}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
            <Button fullWidth loading={status === "sending"} onClick={submit} variant="danger">
              {t("report.submit")}
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
}
