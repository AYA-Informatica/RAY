"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

/** Translated header for the My Ads page. */
export function MyAdsHeader() {
  const { t } = useI18n();
  return (
    <header className="flex items-center gap-3 border-b border-border px-4 py-4">
      <Link href="/profile" aria-label={t("common.back")} className="text-text-secondary">
        <ArrowLeft size={22} />
      </Link>
      <h1 className="font-display text-xl font-bold">{t("myAds.title")}</h1>
    </header>
  );
}
