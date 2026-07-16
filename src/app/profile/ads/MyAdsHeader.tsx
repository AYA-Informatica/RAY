"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

/** Translated header for the My Ads page, with a manual refresh action. */
export function MyAdsHeader() {
  const { t } = useI18n();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <header className="flex items-center gap-3 border-b border-border px-4 py-4">
      <Link href="/profile" aria-label={t("common.back")} className="text-text-secondary lg:hidden">
        <ArrowLeft size={22} />
      </Link>
      <h1 className="flex-1 font-display text-xl font-bold">{t("myAds.title")}</h1>
      <button
        onClick={() => startTransition(() => router.refresh())}
        disabled={isPending}
        aria-label={t("myAds.refresh")}
        className="rounded-pill p-2 text-text-secondary hover:bg-surface-card hover:text-text-primary disabled:opacity-50"
      >
        <RefreshCw size={18} className={isPending ? "animate-spin" : undefined} />
      </button>
    </header>
  );
}
