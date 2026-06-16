"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { timeAgo } from "@/lib/utils/format";

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

export default function AuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/audit")
      .then((r) => r.json())
      .then((j: { data: AuditEntry[] }) => { setEntries(j.data ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold">Audit Log</h1>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          icon={<Clock size={32} />}
          title="No actions logged yet"
          description="Actions will appear here after moderation activity."
        />
      ) : (
        <div>
          {entries.map((entry) => {
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
                    {entry.targetId && (
                      <span className="text-text-muted">
                        {" · ID "}{entry.targetId.slice(0, 8)}…
                      </span>
                    )}
                  </p>
                  {entry.details && (
                    <p className="truncate text-xs text-text-muted">{entry.details}</p>
                  )}
                </div>

                {/* Timestamp */}
                <span className="shrink-0 text-xs text-text-muted">
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
