import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { isStaff } from "@/lib/permissions/roles";
import { AdminNav } from "@/components/admin/AdminNav";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Admin" };

/** Admin shell. Server-gated to staff (admin/moderator) only. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/admin");
  if (!isStaff(user)) redirect("/home");

  // Pass open-report count to the nav so the Reports tab shows a badge.
  let openReports = 0;
  try {
    openReports = await prisma.report.count({ where: { resolved: false } });
  } catch { /* fall back to 0 */ }

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border bg-surface-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
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
        <AdminNav urgentReports={openReports} />
      </header>
      <main className="mx-auto max-w-6xl p-4">{children}</main>
    </div>
  );
}
