import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { getModerationListings } from "@/services/admin";
import { formatPrice, timeAgo } from "@/lib/utils/format";

const STATUS_TONE: Record<string, "success" | "warning" | "danger" | "muted"> = {
  ACTIVE: "success",
  FLAGGED: "warning",
  REMOVED: "danger",
  SOLD: "muted",
  EXPIRED: "muted",
};

/** Listing moderation table. Flagged surface first. */
export default async function AdminListings() {
  const listings = await getModerationListings();
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold">Listings</h1>
      {listings.length === 0 ? (
        <Card className="p-6 text-sm text-text-secondary">No listings yet.</Card>
      ) : (
        <div className="space-y-2">
          {listings.map((l) => (
            <Card key={l.id} className="flex items-center gap-3 p-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium">{l.title}</p>
                  <Badge tone={STATUS_TONE[l.status] ?? "muted"}>{l.status}</Badge>
                  {l._count.reports > 0 && <Badge tone="danger">{l._count.reports} reports</Badge>}
                </div>
                <p className="truncate text-xs text-text-secondary">
                  {formatPrice(l.price)} · {l.category.name} · {l.city} · {l.user.email} ·{" "}
                  {timeAgo(l.createdAt)}
                </p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                {l.status === "REMOVED" ? (
                  <AdminActionButton
                    payload={{ action: "restoreListing", listingId: l.id }}
                    label="Restore"
                    tone="success"
                  />
                ) : (
                  <AdminActionButton
                    payload={{ action: "removeListing", listingId: l.id }}
                    label="Remove"
                    tone="danger"
                  />
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
