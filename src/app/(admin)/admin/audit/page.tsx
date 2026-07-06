"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { timeAgo } from "@/lib/utils/format";
import { logger } from "@/lib/logger";

type AuditEntry = {
  id: string;
  action: string;
  targetType: string;
  targetId: string | null;
  details: string | null;
  createdAt: string;
  admin: { name: string | null; email: string; avatarUrl: string | null };
};

const HUMAN_LABELS: Record<string, string> = {
  remove_listing:      "removed a listing",
  restore_listing:     "restored a listing",
  feature_listing:     "featured a listing",
  unfeature_listing:   "unfeatured a listing",
  resolve_report:      "resolved a report",
  ban_user:            "banned a user",
  unban_user:          "unbanned a user",
  update_announcement: "updated the announcement banner",
};

const ACTION_OPTIONS = [
  { value: "", label: "All actions" },
  { value: "remove_listing", label: "Remove listing" },
  { value: "restore_listing", label: "Restore listing" },
  { value: "feature_listing", label: "Feature listing" },
  { value: "unfeature_listing", label: "Unfeature listing" },
  { value: "resolve_report", label: "Resolve report" },
  { value: "ban_user", label: "Ban user" },
  { value: "unban_user", label: "Unban user" },
  { value: "update_announcement", label: "Announcement" },
];

function TargetLabel({ entry }: { entry: AuditEntry }) {
  const label = entry.details ?? (entry.targetId ? `ID ${entry.targetId.slice(0, 8)}…` : null);
  if (!label) return null;

  if (entry.targetType === "listing" && entry.targetId) {
    return (
      <Link
        href={`/listing/${entry.targetId}`}
        target="_blank"
        className="truncate text-xs text-primary hover:underline"
      >
        {label}
      </Link>
    );
  }

  return <span className="truncate text-xs text-text-muted">{label}</span>;
}

export default function AuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("");

  useEffect(() => {
    fetch("/api/admin/audit")
      .then((r) => r.json())
      .then((j: { data: AuditEntry[] }) => {
        setEntries(j.data ?? []);
        setLoading(false);
        logger.debug({ count: j.data?.length ?? 0 }, "[AuditPage] entries loaded");
      })
      .catch((err) => {
        logger.warn({ message: err?.message }, "[AuditPage] failed to load entries");
        setLoading(false);
      });
  }, []);

  const filtered = actionFilter
    ? entries.filter((e) => e.action === actionFilter)
    : entries;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold">Audit Log</h1>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="rounded-md border border-border bg-surface-card px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {ACTION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Clock size={32} />}
          title={entries.length === 0 ? "No actions logged yet" : "No matching entries"}
          description={entries.length === 0 ? "Actions will appear here after moderation activity." : "Try a different filter."}
        />
      ) : (
        <div>
          {filtered.map((entry) => {
            const initial = (entry.admin.name ?? entry.admin.email).slice(0, 1).toUpperCase();
            return (
              <div
                key={entry.id}
                className="flex items-center gap-3 border-b border-border py-3"
              >
                {/* Avatar */}
                <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-surface-modal grid place-items-center text-xs font-bold text-text-secondary">
                  {entry.admin.avatarUrl ? (
                    <Image
                      src={entry.admin.avatarUrl}
                      alt={entry.admin.name ?? entry.admin.email}
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  ) : (
                    initial
                  )}
                </div>

                {/* Description */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-text-primary">
                    <span className="font-medium">{entry.admin.name ?? entry.admin.email}</span>
                    {" "}
                    {HUMAN_LABELS[entry.action] ?? entry.action}
                  </p>
                  <TargetLabel entry={entry} />
                </div>

                {/* Timestamp */}
                <span
                  className="shrink-0 text-xs text-text-muted"
                  title={new Date(entry.createdAt).toLocaleString()}
                >
                  {timeAgo(entry.createdAt)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
