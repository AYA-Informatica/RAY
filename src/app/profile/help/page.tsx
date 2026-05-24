import { Mail, HelpCircle } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { SubPageHeader } from "../SubPageHeader";

export const metadata = { title: "Help & Support" };

const FAQS = [
  { q: "How do I post an ad?", a: "Tap Sell, choose a category, add photos, fill in the details, and post. It takes under a minute." },
  { q: "Is RAY free?", a: "Yes — posting, browsing and chatting are completely free." },
  { q: "How do payments work?", a: "RAY connects buyers and sellers. You arrange payment directly — cash or mobile money — when you meet." },
  { q: "How long do listings stay up?", a: "Listings stay active for 30 days, then expire. You can repost anytime." },
];

export default function HelpPage() {
  return (
    <AppShell>
      <SubPageHeader titleKey="profile.help" fallback="Help & Support" />
      <div className="space-y-4 p-4">
        <Link
          href="mailto:support@ray.rw"
          className="flex items-center gap-3 rounded-md border border-border bg-surface-card p-4"
        >
          <Mail size={20} className="text-primary" />
          <div>
            <p className="font-medium text-text-primary">Email support</p>
            <p className="text-sm text-text-secondary">support@ray.rw</p>
          </div>
        </Link>

        <div>
          <p className="mb-2 flex items-center gap-2 font-display font-bold">
            <HelpCircle size={18} className="text-primary" /> Frequently asked
          </p>
          <div className="space-y-3">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="rounded-md border border-border bg-surface-card p-3">
                <p className="font-medium text-text-primary">{q}</p>
                <p className="mt-1 text-sm text-text-secondary">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
