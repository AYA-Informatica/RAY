"use client";

import { ShieldCheck, MapPin, Wallet, Eye, Flag } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

const ICONS = [MapPin, Wallet, Eye, ShieldCheck, Flag];

export function SafetyContent() {
  const { t } = useI18n();
  const tips = [1, 2, 3, 4, 5].map((n) => ({
    icon: ICONS[n - 1]!,
    title: t(`safety.tip${n}Title`),
    body: t(`safety.tip${n}Body`),
  }));

  return (
    <div className="space-y-3 p-4">
      {tips.map(({ icon: Icon, title, body }) => (
        <div key={title} className="flex gap-3 rounded-md border border-border bg-surface-card p-4">
          <Icon size={22} className="mt-0.5 shrink-0 text-primary" />
          <div>
            <p className="font-display font-bold text-text-primary">{title}</p>
            <p className="text-sm text-text-secondary">{body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
