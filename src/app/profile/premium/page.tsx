import { Crown, Check } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { SubPageHeader } from "../SubPageHeader";

export const metadata = { title: "Upgrade to Premium" };

const PERKS = [
  "Boost listings to the top of search",
  "Featured badge for faster sales",
  "More active listings at once",
  "Priority placement in your city",
];

export default function PremiumPage() {
  return (
    <AppShell>
      <SubPageHeader titleKey="profile.upgradePremium" fallback="Upgrade to Premium" />
      <div className="p-4">
        <Card className="border-none bg-navy p-6 text-center">
          <Crown size={40} className="mx-auto text-warning" />
          <h2 className="mt-3 font-display text-2xl font-bold">RAY Premium</h2>
          <p className="mt-1 text-sm text-text-secondary">Sell faster, reach more buyers.</p>
          <ul className="mt-5 space-y-2 text-left">
            {PERKS.map((p) => (
              <li key={p} className="flex items-center gap-2 text-sm">
                <Check size={16} className="shrink-0 text-success" /> {p}
              </li>
            ))}
          </ul>
          <p className="mt-6 rounded-md bg-text-primary/10 px-3 py-2 text-xs text-text-secondary">
            Premium launches once RAY reaches enough buyers and sellers in your city. Stay tuned.
          </p>
        </Card>
      </div>
    </AppShell>
  );
}
