"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

/** Translated splash content (client, so it can use the dictionary). */
export function SplashContent() {
  const { t } = useI18n();
  return (
    <main className="relative mx-auto flex min-h-dvh max-w-md flex-col items-center justify-between bg-primary px-6 py-16 text-text-primary">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <h1 className="font-display text-7xl font-extrabold tracking-tight">RAY</h1>
        <p className="mt-1 font-sans text-lg font-medium opacity-95">{t("splash.tagline")}</p>
      </div>
      <Link
        href="/home"
        className="flex w-full max-w-xs items-center justify-center gap-2 rounded-pill bg-text-primary/95 px-6 py-4 font-display text-lg font-bold text-primary shadow-cta transition-transform active:scale-95"
      >
        {t("splash.getStarted")} <ArrowRight size={20} />
      </Link>
    </main>
  );
}
