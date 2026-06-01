"use client";

import { Mail, HelpCircle } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";

export function HelpContent() {
  const { t } = useI18n();
  const faqs = [1, 2, 3, 4].map((n) => ({
    q: t(`help.faq${n}Q`),
    a: t(`help.faq${n}A`),
  }));

  return (
    <div className="space-y-4 p-4">
      <Link
        href="mailto:support@ray.rw"
        className="flex items-center gap-3 rounded-md border border-border bg-surface-card p-4"
      >
        <Mail size={20} className="text-primary" />
        <div>
          <p className="font-medium text-text-primary">{t("help.emailSupport")}</p>
          <p className="text-sm text-text-secondary">support@ray.rw</p>
        </div>
      </Link>

      <div>
        <p className="mb-2 flex items-center gap-2 font-display font-bold">
          <HelpCircle size={18} className="text-primary" /> {t("help.faqTitle")}
        </p>
        <div className="space-y-3">
          {faqs.map(({ q, a }) => (
            <div key={q} className="rounded-md border border-border bg-surface-card p-3">
              <p className="font-medium text-text-primary">{q}</p>
              <p className="mt-1 text-sm text-text-secondary">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
