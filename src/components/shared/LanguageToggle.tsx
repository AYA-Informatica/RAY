"use client";

import { Globe } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { LOCALES, LOCALE_LABELS } from "@/i18n/dictionaries";
import { cn } from "@/lib/utils/cn";
import { logger } from "@/lib/logger";

const LOCALE_SHORT: Record<string, string> = { en: "EN", rw: "RW", fr: "FR" };

/** Inline language switcher — auto-adapts when new locales are added. */
export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  return (
    <div className={cn("flex items-center gap-3 px-4 py-3.5", className)}>
      <Globe size={20} className="text-text-secondary" />
      <span className="font-medium text-text-primary">{t("profile.language")}</span>
      <div className="ml-auto flex gap-1 rounded-pill bg-surface-modal p-1">
        {LOCALES.map((l) => (
          <button
            key={l}
            onClick={() => {
              logger.debug({ from: locale, to: l }, "[LanguageToggle] locale switched");
              setLocale(l);
            }}
            aria-label={LOCALE_LABELS[l]}
            aria-pressed={locale === l}
            className={cn(
              "rounded-pill px-3 py-1 text-xs font-medium transition-colors",
              locale === l ? "bg-primary text-text-primary" : "text-text-secondary hover:text-text-primary",
            )}
          >
            {LOCALE_SHORT[l] ?? l.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
