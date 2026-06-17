"use client";

import { useI18n } from "@/i18n/I18nProvider";

export default function OfflinePage() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-surface-card text-4xl">
        📡
      </div>
      <div className="space-y-2">
        <h1 className="font-display text-2xl font-bold text-text-primary">{t("offline.title")}</h1>
        <p className="text-sm text-text-secondary">{t("offline.body")}</p>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="rounded-pill bg-primary px-6 py-3 font-display font-bold text-text-primary transition-colors hover:bg-primary-dark active:scale-95"
      >
        {t("offline.retry")}
      </button>
    </div>
  );
}
