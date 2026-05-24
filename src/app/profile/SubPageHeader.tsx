"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

/** Back-header for profile sub-pages. `titleKey` is an i18n key. */
export function SubPageHeader({ titleKey, fallback }: { titleKey: string; fallback: string }) {
  const { t } = useI18n();
  const title = t(titleKey);
  return (
    <header className="flex items-center gap-3 border-b border-border px-4 py-4">
      <Link href="/profile" aria-label={t("common.back")} className="text-text-secondary">
        <ArrowLeft size={22} />
      </Link>
      <h1 className="font-display text-xl font-bold">{title === titleKey ? fallback : title}</h1>
    </header>
  );
}
