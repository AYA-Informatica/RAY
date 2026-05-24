"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { LOCALES, translate, type Locale } from "./dictionaries";

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const COOKIE = "ray_locale";

/** Provides locale + a `t()` translator. Persists choice in a cookie. */
export function I18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    // 1-year cookie; read by the server layout for SSR.
    document.cookie = `${COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
  }, []);

  const t = useCallback((key: string) => translate(locale, key), [locale]);

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** Access translation + locale anywhere under the provider. */
export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

/** Server helper: parse the locale cookie value safely. */
export function parseLocale(raw: string | undefined): Locale {
  return LOCALES.includes(raw as Locale) ? (raw as Locale) : "en";
}
