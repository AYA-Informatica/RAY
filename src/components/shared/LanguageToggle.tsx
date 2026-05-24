"use client";

import { Globe } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { LOCALES, LOCALE_LABELS } from "@/i18n/dictionaries";
import { cn } from "@/lib/utils/cn";

/** Inline language switcher (English / Kinyarwanda). */
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
            onClick={() => setLocale(l)}
            className={cn(
              "rounded-pill px-3 py-1 text-xs font-medium transition-colors",
              locale === l ? "bg-primary text-text-primary" : "text-text-secondary",
            )}
          >
            {LOCALE_LABELS[l]}
          </button>
        ))}
      </div>
    </div>
  );
}
