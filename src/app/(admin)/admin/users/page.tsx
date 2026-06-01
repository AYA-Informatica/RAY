"use client";

import { useState, useTransition, useEffect } from "react";
import Image from "next/image";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { ToastStack, useToast } from "@/components/admin/AdminToast";
import { timeAgo } from "@/lib/utils/format";

type User = {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
  role: string;
  isBanned: boolean;
  createdAt: string | Date;
  _count: { listings: number };
};

async function fetchUsers(): Promise<User[]> {
  const res = await fetch("/api/admin/users", { cache: "no-store" });
  if (!res.ok) return [];
  const json = await res.json() as { data: User[] };
  return json.data ?? [];
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState("");
  const [, startTransition] = useTransition();
  const { toasts, show } = useToast();

  useEffect(() => {
    startTransition(() => {
      void fetchUsers().then(setUsers);
    });
  }, []);

  const filtered = users.filter((u) => {
    const q = query.toLowerCase();
    return (
      !q ||
      u.email.toLowerCase().includes(q) ||
      (u.name ?? "").toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  function refresh() {
    startTransition(() => {
      void fetchUsers().then(setUsers);
    });
  }

  return (
    <div className="space-y-4">
      <ToastStack toasts={toasts} />

      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold">Users</h1>
        <div className="relative max-w-xs flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or email…"
            className="w-full rounded-md border border-border bg-surface-card py-2 pl-8 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-6 text-sm text-text-secondary">
          {users.length === 0 ? "No users yet." : "No users match your search."}
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((u) => (
            <Card key={u.id} className="flex items-center gap-3 p-3">
              {/* Avatar */}
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-pill bg-surface-modal">
                {u.avatarUrl ? (
                  <Image src={u.avatarUrl} alt={u.name ?? "User"} fill className="object-cover" sizes="40px" />
                ) : (
                  <span className="grid h-full w-full place-items-center text-sm font-bold text-text-secondary">
                    {(u.name ?? u.email).charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-medium">{u.name ?? "RAY user"}</p>
                  {u.role !== "USER" && <Badge tone="warning">{u.role}</Badge>}
                  {u.isBanned && <Badge tone="danger">Banned</Badge>}
                </div>
                <p className="truncate text-xs text-text-secondary">
                  {u.email} · {u._count.listings} listing{u._count.listings !== 1 ? "s" : ""} · joined {timeAgo(u.createdAt)}
                </p>
              </div>

              {/* Action */}
              <div className="shrink-0">
                {u.isBanned ? (
                  <AdminActionButton
                    payload={{ action: "unbanUser", userId: u.id }}
                    label="Unban"
                    tone="success"
                    onDone={(ok) => { show(ok ? "User unbanned" : "Action failed", ok ? "success" : "danger"); if (ok) refresh(); }}
                  />
                ) : (
                  <AdminActionButton
                    payload={{ action: "banUser", userId: u.id }}
                    label="Ban"
                    tone="danger"
                    confirm={`Ban ${u.email}? They won't be able to post or chat.`}
                    onDone={(ok) => { show(ok ? "User banned" : "Action failed", ok ? "success" : "danger"); if (ok) refresh(); }}
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
