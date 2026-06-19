"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

const SECTION_KEYS = [
  {
    titleKey: "privacy.sec1Title",
    bodyKey: "privacy.sec1Body",
  },
  {
    titleKey: "privacy.sec2Title",
    itemKeys: ["privacy.sec2Item1", "privacy.sec2Item2", "privacy.sec2Item3", "privacy.sec2Item4"],
  },
  {
    titleKey: "privacy.sec3Title",
    itemKeys: ["privacy.sec3Item1", "privacy.sec3Item2", "privacy.sec3Item3", "privacy.sec3Item4"],
  },
];

const SECTION_KEYS_AFTER_RIGHTS = [
  {
    titleKey: "privacy.sec4Title",
    bodyKey: "privacy.sec4Body",
    hasControllerNote: true,
  },
  {
    titleKey: "privacy.sec5Title",
    itemKeys: ["privacy.sec5Item1", "privacy.sec5Item2", "privacy.sec5Item3", "privacy.sec5Item4"],
  },
  {
    titleKey: "privacy.sec6Title",
    bodyKey: "privacy.sec6Body",
  },
];

const RIGHTS: { titleKey: string; bodyKey: string; actionKey: string; altActionKey?: string; href?: string }[] = [
  { titleKey: "privacy.right1Title", bodyKey: "privacy.right1Body", actionKey: "privacy.right1Action" },
  { titleKey: "privacy.right2Title", bodyKey: "privacy.right2Body", actionKey: "privacy.right2Action" },
  { titleKey: "privacy.right3Title", bodyKey: "privacy.right3Body", actionKey: "privacy.right3Action" },
  { titleKey: "privacy.right4Title", bodyKey: "privacy.right4Body", actionKey: "privacy.right4Action" },
  { titleKey: "privacy.right5Title", bodyKey: "privacy.right5Body", actionKey: "privacy.right5Action" },
  { titleKey: "privacy.right6Title", bodyKey: "privacy.right6Body", actionKey: "privacy.right6Action", altActionKey: "privacy.right6ActionAlt", href: "/profile/ads" },
  { titleKey: "privacy.right7Title", bodyKey: "privacy.right7Body", actionKey: "privacy.right7Action", href: "/profile/edit" },
  { titleKey: "privacy.right8Title", bodyKey: "privacy.right8Body", actionKey: "privacy.right8Action" },
  { titleKey: "privacy.right9Title", bodyKey: "privacy.right9Body", actionKey: "privacy.right9Action" },
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
        {/* Sections 1–3 (before rights) */}
        {SECTION_KEYS.map((s) => (
          <section key={s.titleKey}>
            <h2 className="mb-2 font-display font-bold text-text-primary">{t(s.titleKey)}</h2>
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

        {/* Your Rights Under Rwandan Law (Articles 18–26) */}
        <section>
          <h2 className="mb-3 font-display font-bold text-text-primary">{t("privacy.rightsTitle")}</h2>
          <div className="space-y-3">
            {RIGHTS.map((r) => (
              <div key={r.titleKey} className="rounded-md border border-border bg-surface-card p-4">
                <h3 className="font-display font-bold text-text-primary">{t(r.titleKey)}</h3>
                <p className="mt-1 text-sm text-text-secondary">{t(r.bodyKey)}</p>
                {r.href ? (
                  <>
                    <Link href={r.href} className="mt-2 inline-block text-sm text-primary underline">
                      {t(r.actionKey)} →
                    </Link>
                    {r.altActionKey && (
                      <p className="mt-1 text-sm text-text-secondary">{t(r.altActionKey)}</p>
                    )}
                  </>
                ) : (
                  <p className="mt-2 text-sm text-primary">{t(r.actionKey)}</p>
                )}
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-text-secondary">{t("privacy.rightsClosing")}</p>
        </section>

        {/* Sections 4–6 (after rights) */}
        {SECTION_KEYS_AFTER_RIGHTS.map((s) => (
          <section key={s.titleKey}>
            <h2 className="mb-2 font-display font-bold text-text-primary">{t(s.titleKey)}</h2>
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
            {"hasControllerNote" in s && s.hasControllerNote && (
              <p className="mt-2 text-sm text-text-secondary">{t("privacy.controllerNote")}</p>
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
