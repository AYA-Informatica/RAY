"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * Back-header for profile sub-pages.
 * Mobile/tablet: back arrow + title.
 * Desktop: title only (TopNav already provides back-navigation context).
 */
export function SubPageHeader({ titleKey, fallback }: { titleKey: string; fallback: string }) {
  const { t } = useI18n();
  const title = t(titleKey);
  const label = title === titleKey ? fallback : title;
  return (
    <header className="flex items-center gap-3 border-b border-border px-4 py-4">
      <Link
        href="/profile"
        aria-label={t("common.back")}
        className="text-text-secondary lg:hidden"
      >
        <ArrowLeft size={22} />
      </Link>
      <h1 className="font-display text-xl font-bold">{label}</h1>
    </header>
  );
}
