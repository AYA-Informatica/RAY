"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/i18n/I18nProvider";
import { logger } from "@/lib/logger";

export default function ProfileError({ error, reset }: { error: Error; reset: () => void }) {
  const { t } = useI18n();
  useEffect(() => {
    logger.error({ message: error.message }, "Profile error");
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center bg-background">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface-card p-10">
        <p className="font-display text-5xl">👤</p>
        <h1 className="mt-4 font-display text-xl font-bold">{t("error.title")}</h1>
        <p className="mt-2 text-sm text-text-secondary">{t("error.body")}</p>
        <div className="mt-6">
          <Button onClick={reset}>{t("error.tryAgain")}</Button>
        </div>
      </div>
    </main>
  );
}
