import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { getManagedUsers } from "@/services/admin";
import { timeAgo } from "@/lib/utils/format";

/** User management. Banning is admin-only (enforced server-side). */
export default async function AdminUsers() {
  const users = await getManagedUsers();
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold">Users</h1>
      {users.length === 0 ? (
        <Card className="p-6 text-sm text-text-secondary">No users yet.</Card>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <Card key={u.id} className="flex items-center gap-3 p-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium">{u.name ?? "RAY user"}</p>
                  {u.role !== "USER" && <Badge tone="navy">{u.role}</Badge>}
                  {u.isBanned && <Badge tone="danger">Banned</Badge>}
                </div>
                <p className="truncate text-xs text-text-secondary">
                  {u.email} · {u._count.listings} listings · joined {timeAgo(u.createdAt)}
                </p>
              </div>
              <div className="shrink-0">
                {u.isBanned ? (
                  <AdminActionButton
                    payload={{ action: "unbanUser", userId: u.id }}
                    label="Unban"
                    tone="success"
                  />
                ) : (
                  <AdminActionButton
                    payload={{ action: "banUser", userId: u.id }}
                    label="Ban"
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
