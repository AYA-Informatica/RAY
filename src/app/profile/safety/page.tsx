import { ShieldCheck, MapPin, Wallet, Eye, Flag } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { SubPageHeader } from "../SubPageHeader";

export const metadata = { title: "Safety Tips" };

const TIPS = [
  { icon: MapPin, title: "Meet in public", body: "Always meet sellers and buyers in busy, public places during the day." },
  { icon: Wallet, title: "Never pay in advance", body: "Inspect the item in person first. Never send money before you receive what you're buying." },
  { icon: Eye, title: "Inspect carefully", body: "Check the item works and matches the listing before paying. Test phones, cars, electronics." },
  { icon: ShieldCheck, title: "Trust your instincts", body: "If a deal feels too good or a person feels off, walk away. There's always another listing." },
  { icon: Flag, title: "Report suspicious activity", body: "Use the report button on any listing or chat that looks like a scam. You help keep RAY safe." },
];

export default function SafetyTipsPage() {
  return (
    <AppShell>
      <SubPageHeader titleKey="profile.safety" fallback="Safety Tips" />
      <div className="space-y-3 p-4">
        {TIPS.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex gap-3 rounded-md border border-border bg-surface-card p-4">
            <Icon size={22} className="mt-0.5 shrink-0 text-primary" />
            <div>
              <p className="font-display font-bold text-text-primary">{title}</p>
              <p className="text-sm text-text-secondary">{body}</p>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
