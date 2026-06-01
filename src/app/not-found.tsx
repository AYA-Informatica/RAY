"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/i18n/I18nProvider";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center bg-background">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface-card p-10 lg:shadow-[0_16px_48px_rgba(0,0,0,0.4)]">
        <p className="font-display text-6xl font-extrabold text-primary">404</p>
        <h1 className="mt-4 font-display text-xl font-bold">{t("notFound.title")}</h1>
        <p className="mt-2 text-sm text-text-secondary">{t("notFound.body")}</p>
        <div className="mt-6">
          <Link href="/home">
            <Button>{t("notFound.back")}</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
