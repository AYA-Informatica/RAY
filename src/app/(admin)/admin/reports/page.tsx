"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, Search } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { ToastStack, useToast } from "@/components/admin/AdminToast";
import { timeAgo } from "@/lib/utils/format";

type Report = {
  id: string;
  reason: string;
  details: string | null;
  createdAt: string | Date;
  reporter: { name: string | null; email: string };
  listing: { id: string; title: string; status: string } | null;
};

async function fetchReports(): Promise<Report[]> {
  const res = await fetch("/api/admin/reports", { cache: "no-store" });
  if (!res.ok) return [];
  const json = await res.json() as { data: Report[] };
  return json.data ?? [];
}

export default function AdminReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [query, setQuery] = useState("");
  const [, startTransition] = useTransition();
  const { toasts, show } = useToast();

  useEffect(() => {
    startTransition(() => {
      void fetchReports().then(setReports);
    });
  }, []);

  const filtered = reports.filter((r) => {
    const q = query.toLowerCase();
    return (
      !q ||
      r.reason.toLowerCase().includes(q) ||
      (r.listing?.title.toLowerCase() ?? "").includes(q) ||
      (r.reporter.name?.toLowerCase() ?? "").includes(q) ||
      r.reporter.email.toLowerCase().includes(q) ||
      (r.details?.toLowerCase() ?? "").includes(q)
    );
  });

  function refresh() {
    startTransition(() => {
      void fetchReports().then(setReports);
    });
  }

  return (
    <div className="space-y-4">
      <ToastStack toasts={toasts} />

      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold">
          Reports
          {reports.length > 0 && (
            <span className="ml-2 text-base font-normal text-text-secondary">({reports.length})</span>
          )}
        </h1>
        <div className="relative max-w-xs flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search listing, reporter, reason…"
            className="w-full rounded-md border border-border bg-surface-card py-2 pl-8 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        reports.length === 0 ? (
          <EmptyState
            icon={<ShieldCheck size={32} />}
            title="No open reports"
            description="The queue is clear."
          />
        ) : (
          <Card className="p-6 text-sm text-text-secondary">No reports match your search.</Card>
        )
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <Card key={r.id} className="flex items-start gap-3 p-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="danger">{r.reason}</Badge>
                  {r.listing && (
                    <Link
                      href={`/listing/${r.listing.id}`}
                      target="_blank"
                      className="truncate text-sm text-primary hover:underline"
                    >
                      {r.listing.title}
                    </Link>
                  )}
                  {r.listing && r.listing.status !== "ACTIVE" && (
                    <Badge tone="muted">{r.listing.status}</Badge>
                  )}
                </div>
                {r.details && (
                  <p className="mt-1 text-sm text-text-secondary">{r.details}</p>
                )}
                <p className="mt-1 text-xs text-text-muted">
                  Reported by {r.reporter.name ?? r.reporter.email} · {timeAgo(r.createdAt)}
                </p>
              </div>

              {/* Two clearly-labelled resolve paths */}
              <div className="flex shrink-0 flex-col gap-1.5">
                {r.listing && r.listing.status === "ACTIVE" && (
                  <AdminActionButton
                    payload={{ action: "removeListing", listingId: r.listing.id }}
                    label="Remove listing"
                    tone="danger"
                    confirm={`Remove "${r.listing.title}" from the marketplace?`}
                    onDone={(ok) => { show(ok ? "Listing removed" : "Action failed", ok ? "success" : "danger"); if (ok) refresh(); }}
                  />
                )}
                <AdminActionButton
                  payload={{ action: "resolveReport", reportId: r.id, outcome: "no_action" }}
                  label="Not a violation"
                  tone="default"
                  onDone={(ok) => { show(ok ? "Report resolved — no action taken" : "Action failed", ok ? "success" : "danger"); if (ok) refresh(); }}
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
