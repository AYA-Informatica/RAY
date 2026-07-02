"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";

export function RecentListingsSectionHeader() {
  const { t } = useI18n();
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-display text-lg font-bold lg:text-xl">{t("home.recentListings")}</h2>
      <Link href="/search" className="text-sm text-primary hover:underline">
        {t("home.seeAll")}
      </Link>
    </div>
  );
}
