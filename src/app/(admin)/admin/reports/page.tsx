import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { getOpenReports } from "@/services/admin";
import { timeAgo } from "@/lib/utils/format";
import { ShieldCheck } from "lucide-react";

/** Open report queue. Resolving a report does not auto-remove the listing. */
export default async function AdminReports() {
  const reports = await getOpenReports();
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold">Reports</h1>
      {reports.length === 0 ? (
        <EmptyState icon={<ShieldCheck size={32} />} title="No open reports" description="The queue is clear." />
      ) : (
        <div className="space-y-2">
          {reports.map((r) => (
            <Card key={r.id} className="flex items-start gap-3 p-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Badge tone="danger">{r.reason}</Badge>
                  {r.listing && (
                    <Link href={`/listing/${r.listing.id}`} className="truncate text-sm text-primary">
                      {r.listing.title}
                    </Link>
                  )}
                </div>
                {r.details && <p className="mt-1 text-sm text-text-secondary">{r.details}</p>}
                <p className="mt-1 text-xs text-text-muted">
                  by {r.reporter.name ?? r.reporter.email} · {timeAgo(r.createdAt)}
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-1.5">
                {r.listing && (
                  <AdminActionButton
                    payload={{ action: "removeListing", listingId: r.listing.id }}
                    label="Remove listing"
                    tone="danger"
                  />
                )}
                <AdminActionButton
                  payload={{ action: "resolveReport", reportId: r.id }}
                  label="Resolve"
                  tone="success"
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
