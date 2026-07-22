"use client";

import { useState } from "react";
import { Mail, HelpCircle, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";

export function HelpContent() {
  const { t } = useI18n();
  const faqs = [1, 2, 3, 4].map((n) => ({
    q: t(`help.faq${n}Q`),
    a: t(`help.faq${n}A`),
  }));
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="space-y-4 p-4">
      <Link
        href="mailto:support@raymarkets.co"
        className="flex items-center gap-3 rounded-md border border-border bg-surface-card p-4"
      >
        <Mail size={20} className="text-primary" />
        <div>
          <p className="font-medium text-text-primary">{t("help.emailSupport")}</p>
          <p className="text-sm text-text-secondary">support@raymarkets.co</p>
        </div>
      </Link>

      <div>
        <p className="mb-2 flex items-center gap-2 font-display font-bold">
          <HelpCircle size={18} className="text-primary" /> {t("help.faqTitle")}
        </p>
        <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-surface-card">
          {faqs.map(({ q, a }, i) => (
            <div key={q}>
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="flex w-full items-center justify-between gap-3 p-3 text-left"
                aria-expanded={openIdx === i}
              >
                <span className="font-medium text-text-primary">{q}</span>
                <ChevronDown
                  size={16}
                  className={`shrink-0 text-text-secondary transition-transform ${openIdx === i ? "rotate-180" : ""}`}
                />
              </button>
              {openIdx === i && (
                <p className="px-3 pb-3 text-sm text-text-secondary">{a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
