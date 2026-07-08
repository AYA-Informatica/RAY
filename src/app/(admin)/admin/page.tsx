import Link from "next/link";
import { Users, ListChecks, Flag, AlertTriangle, Star, TrendingUp, UserX, Activity } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { getAdminStats } from "@/services/admin";
import { AnnouncementEditor } from "./AnnouncementEditor";
import { CategoryHealthTable } from "./CategoryHealthTable";
import { logger } from "@/lib/logger";

/** Admin overview — key moderation/analytics-foundation counts. */
export default async function AdminOverview() {
  logger.debug("[AdminOverview] rendering");
  const stats = await getAdminStats();
  logger.debug({ users: stats.users, listings: stats.listings, openReports: stats.openReports }, "[AdminOverview] stats loaded");
  const cards = [
    { label: "Total Users", value: stats.users, icon: Users, tone: "text-text-primary" },
    { label: "Active Listings", value: stats.listings, icon: ListChecks, tone: "text-success" },
    { label: "Featured (active)", value: stats.featured, icon: Star, tone: "text-primary" },
    { label: "Flagged", value: stats.flagged, icon: AlertTriangle, tone: "text-warning" },
    { label: "Open Reports", value: stats.openReports, icon: Flag, tone: "text-danger" },
    { label: "New Users (7d)", value: stats.newUsers, icon: TrendingUp, tone: "text-success" },
    // Fix 9: Monthly Active Users via lastSeenAt.
    { label: "MAU (30d)", value: stats.mau, icon: Activity, tone: "text-primary" },
    // Fix 10: banned count for at-a-glance moderation health.
    { label: "Banned Users", value: stats.bannedUsers, icon: UserX, tone: stats.bannedUsers > 0 ? "text-danger" : "text-text-muted" },
  ];
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Overview</h1>

      <AnnouncementEditor />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <Card key={label} className="p-4">
            <Icon size={20} className={tone} />
            <p className="mt-2 font-display text-3xl font-bold">{value}</p>
            <p className="text-sm text-text-secondary">{label}</p>
          </Card>
        ))}
      </div>

      <Link
        href="/admin/analytics"
        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        View full analytics →
      </Link>

      <CategoryHealthTable />
    </div>
  );
}
