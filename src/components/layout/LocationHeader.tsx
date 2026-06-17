"use client";

import Link from "next/link";
import { MapPin, Heart } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { LOCALES, type Locale } from "@/i18n/dictionaries";

const LOCALE_LABEL: Record<Locale, string> = { en: "ENG", rw: "KINY", fr: "FR" };

export function LocationHeader({ location = "Rwanda" }: { location?: string }) {
  const { locale, setLocale, t } = useI18n();

  function cycleLocale() {
    const idx = LOCALES.indexOf(locale as Locale);
    setLocale(LOCALES[(idx + 1) % LOCALES.length] as Locale);
  }

  return (
    <div className="bg-primary px-4 pb-5 pt-4">
      <div className="flex items-center justify-between text-text-primary">
        <div className="flex items-center gap-1.5">
          <MapPin size={20} />
          <span className="font-display text-lg font-bold">{location}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={cycleLocale}
            aria-label="Switch language"
            className="rounded-pill px-2.5 py-1 text-[11px] font-bold tracking-wide text-text-primary ring-1 ring-text-primary/30 transition-colors active:bg-text-primary/10"
          >
            {LOCALE_LABEL[locale]}
          </button>
          <Link href="/favorites" aria-label="Favorites">
            <Heart size={22} />
          </Link>
        </div>
      </div>

      <Link
        href="/search"
        className="mt-4 block rounded-md bg-text-primary/15 px-4 py-3 text-sm text-text-primary/80"
      >
        {t("home.searchPlaceholder")}
      </Link>
    </div>
  );
}
