import { Users, ListChecks, Flag, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { getAdminStats } from "@/services/admin";
import { AnnouncementEditor } from "./AnnouncementEditor";
import { CategoryHealthTable } from "./CategoryHealthTable";

/** Admin overview — key moderation/analytics-foundation counts. */
export default async function AdminOverview() {
  const stats = await getAdminStats();
  const cards = [
    { label: "Total Users", value: stats.users, icon: Users, tone: "text-text-primary" },
    { label: "Active Listings", value: stats.listings, icon: ListChecks, tone: "text-success" },
    { label: "Flagged", value: stats.flagged, icon: AlertTriangle, tone: "text-warning" },
    { label: "Open Reports", value: stats.openReports, icon: Flag, tone: "text-danger" },
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

      <CategoryHealthTable />

      <Card className="p-4 text-sm text-text-secondary">
        Listings publish instantly. Reports raise moderation visibility; 3+ open reports on a
        listing auto-flag it for review. Use the tabs above to moderate.
      </Card>
    </div>
  );
}
