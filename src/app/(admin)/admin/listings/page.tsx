"use client";

import { useState, useTransition, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { ToastStack, useToast } from "@/components/admin/AdminToast";
import { formatPrice, timeAgo } from "@/lib/utils/format";

// ── Types (mirrors what getModerationListings returns) ──────────────────────
type Report = {
  id: string;
  reason: string;
  details: string | null;
  createdAt: string | Date;
  reporter: { name: string | null; email: string };
};

type Listing = {
  id: string;
  title: string;
  price: number;
  status: string;
  city: string;
  createdAt: string | Date;
  user: { email: string; name: string | null };
  category: { name: string };
  images: { url: string }[];
  reports: Report[];
  _count: { reports: number };
};

const STATUS_TONE: Record<string, "success" | "warning" | "danger" | "muted"> = {
  ACTIVE:  "success",
  FLAGGED: "warning",
  REMOVED: "danger",
  SOLD:    "muted",
  EXPIRED: "muted",
};

// ── Data fetching (server action via client fetch) ──────────────────────────
async function fetchListings(): Promise<Listing[]> {
  const res = await fetch("/api/admin/listings", { cache: "no-store" });
  if (!res.ok) return [];
  const json = await res.json() as { data: Listing[] };
  return json.data ?? [];
}

// ── Component ───────────────────────────────────────────────────────────────
export default function AdminListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const { toasts, show } = useToast();

  useEffect(() => {
    startTransition(() => {
      void fetchListings().then(setListings);
    });
  }, []);

  const filtered = listings.filter((l) => {
    const q = query.toLowerCase();
    return (
      !q ||
      l.title.toLowerCase().includes(q) ||
      l.user.email.toLowerCase().includes(q) ||
      l.status.toLowerCase().includes(q) ||
      l.category.name.toLowerCase().includes(q) ||
      l.city.toLowerCase().includes(q)
    );
  });

  function refresh() {
    startTransition(() => {
      void fetchListings().then(setListings);
    });
  }

  return (
    <div className="space-y-4">
      <ToastStack toasts={toasts} />

      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold">Listings</h1>
        <div className="relative max-w-xs flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, email, status…"
            className="w-full rounded-md border border-border bg-surface-card py-2 pl-8 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-6 text-sm text-text-secondary">
          {listings.length === 0 ? "No listings yet." : "No listings match your search."}
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((l) => {
            const thumb = l.images[0]?.url;
            const isExpanded = expanded === l.id;
            const hasReports = l.reports.length > 0;

            return (
              <Card key={l.id} className="overflow-hidden">
                {/* ── Main row ── */}
                <div className="flex items-center gap-3 p-3">
                  {/* Thumbnail */}
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-surface-modal">
                    {thumb ? (
                      <Image src={thumb} alt={l.title} fill className="object-cover" sizes="56px" />
                    ) : (
                      <span className="grid h-full w-full place-items-center text-xl">📦</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/listing/${l.id}`}
                        target="_blank"
                        className="truncate font-medium hover:text-primary"
                      >
                        {l.title}
                      </Link>
                      <Badge tone={STATUS_TONE[l.status] ?? "muted"}>{l.status}</Badge>
                      {l._count.reports > 0 && (
                        <Badge tone="danger">{l._count.reports} report{l._count.reports !== 1 ? "s" : ""}</Badge>
                      )}
                    </div>
                    <p className="truncate text-xs text-text-secondary">
                      {formatPrice(l.price)} · {l.category.name} · {l.city} · {l.user.email} · {timeAgo(l.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-1.5">
                    {l.status === "REMOVED" ? (
                      <AdminActionButton
                        payload={{ action: "restoreListing", listingId: l.id }}
                        label="Restore"
                        tone="success"
                        onDone={(ok) => { show(ok ? "Listing restored" : "Action failed", ok ? "success" : "danger"); if (ok) refresh(); }}
                      />
                    ) : (
                      <AdminActionButton
                        payload={{ action: "removeListing", listingId: l.id }}
                        label="Remove"
                        tone="danger"
                        confirm={`Remove "${l.title}"? It will be hidden from the marketplace.`}
                        onDone={(ok) => { show(ok ? "Listing removed" : "Action failed", ok ? "success" : "danger"); if (ok) refresh(); }}
                      />
                    )}
                    {hasReports && (
                      <button
                        onClick={() => setExpanded(isExpanded ? null : l.id)}
                        className="rounded-sm px-2 py-1 text-xs text-text-secondary hover:bg-surface-modal"
                        aria-expanded={isExpanded}
                      >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    )}
                  </div>
                </div>

                {/* ── Inline reports (expandable) ── */}
                {isExpanded && hasReports && (
                  <div className="border-t border-border bg-surface-card/50 px-3 py-2 space-y-2">
                    <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Open reports</p>
                    {l.reports.map((r) => (
                      <div key={r.id} className="flex items-start justify-between gap-3 rounded-md bg-surface-modal px-3 py-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge tone="danger">{r.reason}</Badge>
                            <span className="text-xs text-text-muted">
                              by {r.reporter.name ?? r.reporter.email} · {timeAgo(r.createdAt)}
                            </span>
                          </div>
                          {r.details && (
                            <p className="mt-1 text-xs text-text-secondary">{r.details}</p>
                          )}
                        </div>
                        <div className="flex shrink-0 gap-1.5">
                          <AdminActionButton
                            payload={{ action: "resolveReport", reportId: r.id, outcome: "no_action" }}
                            label="Not a violation"
                            tone="default"
                            onDone={(ok) => { show(ok ? "Report resolved — no action taken" : "Action failed", ok ? "success" : "danger"); if (ok) refresh(); }}
                          />
                          <AdminActionButton
                            payload={{ action: "resolveReport", reportId: r.id, outcome: "listing_removed" }}
                            label="Remove & resolve"
                            tone="danger"
                            confirm="Remove the listing and mark this report as resolved?"
                            onDone={(ok) => { show(ok ? "Listing removed and report resolved" : "Action failed", ok ? "success" : "danger"); if (ok) refresh(); }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
