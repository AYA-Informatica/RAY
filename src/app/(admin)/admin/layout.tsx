import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, ListChecks, Users, Flag, ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { isStaff } from "@/lib/permissions/roles";

export const metadata = { title: "Admin" };

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/listings", label: "Listings", icon: ListChecks },
  { href: "/admin/reports", label: "Reports", icon: Flag },
  { href: "/admin/users", label: "Users", icon: Users },
];

/** Admin shell. Server-gated to staff (admin/moderator) only. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/admin");
  if (!isStaff(user)) redirect("/home");

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border bg-surface-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/home" className="text-text-secondary" aria-label="Exit admin">
              <ArrowLeft size={20} />
            </Link>
            <span className="font-display text-lg font-bold">
              RAY <span className="text-primary">Admin</span>
            </span>
          </div>
          <span className="text-xs text-text-secondary">
            {user.name ?? user.email} · {user.role}
          </span>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 pb-2">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-modal hover:text-text-primary"
            >
              <Icon size={15} /> {label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl p-4">{children}</main>
    </div>
  );
}
