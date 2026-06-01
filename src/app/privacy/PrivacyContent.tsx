"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

const SECTION_KEYS = [
  {
    titleEn: "What we make public",
    bodyKey: "privacy.sec1Body",
  },
  {
    titleEn: "What stays private",
    itemKeys: ["privacy.sec2Item1", "privacy.sec2Item2", "privacy.sec2Item3", "privacy.sec2Item4"],
  },
  {
    titleEn: "Your control",
    itemKeys: ["privacy.sec3Item1", "privacy.sec3Item2", "privacy.sec3Item3", "privacy.sec3Item4"],
  },
  {
    titleEn: "Third parties",
    bodyKey: "privacy.sec4Body",
  },
  {
    titleEn: "Data we collect",
    itemKeys: ["privacy.sec5Item1", "privacy.sec5Item2", "privacy.sec5Item3", "privacy.sec5Item4"],
  },
  {
    titleEn: "Changes to this policy",
    bodyKey: "privacy.sec6Body",
  },
];

export function PrivacyContent() {
  const { t } = useI18n();
  return (
    <div className="p-4">
      <div className="mb-6 flex items-center gap-3">
        <ShieldCheck size={28} className="text-primary" />
        <div>
          <h1 className="font-display text-2xl font-bold">{t("privacy.title")}</h1>
          <p className="text-sm text-text-secondary">Last updated: June 2026</p>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-primary/30 bg-primary/10 p-4">
        <p className="text-sm font-medium text-text-primary">{t("privacy.tagline")}</p>
      </div>

      <div className="space-y-5">
        {SECTION_KEYS.map((s) => (
          <section key={s.titleEn}>
            <h2 className="mb-2 font-display font-bold text-text-primary">
              {t(`privacy.sec${SECTION_KEYS.indexOf(s) + 1}Title`) || s.titleEn}
            </h2>
            {"itemKeys" in s ? (
              <ul className="space-y-2">
                {s.itemKeys!.map((key) => (
                  <li key={key} className="flex gap-2 text-sm text-text-secondary">
                    <span className="mt-0.5 shrink-0 text-primary">•</span>
                    {t(key)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-text-secondary">{t(s.bodyKey!)}</p>
            )}
          </section>
        ))}
      </div>

      <div className="mt-8 border-t border-border pt-4 text-center text-xs text-text-muted">
        Questions?{" "}
        <Link href="mailto:support@ray.rw" className="text-primary underline">
          support@ray.rw
        </Link>
      </div>
    </div>
  );
}
