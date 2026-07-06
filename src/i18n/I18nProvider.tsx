"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { translate, type Locale } from "./dictionaries";
import { logger } from "@/lib/logger";

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, params?: Record<string, string>) => string;
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
    logger.debug({ locale: l }, "[I18nProvider] setLocale called");
    setLocaleState(l);
    // Update the html[lang] attribute immediately so screen readers
    // announce content in the correct language without waiting for SSR.
    if (typeof document !== "undefined") {
      document.documentElement.lang = l;
      // 1-year cookie; read by the server layout for SSR on next load.
      // Only add `secure` on HTTPS — the flag prevents the browser from sending
    // the cookie back to the server on HTTP (dev), which would cause every
    // server-rendered page to reset to "en" regardless of the user's choice.
    const secure = window.location.protocol === "https:" ? "; secure" : "";
    document.cookie = `${COOKIE}=${l}; path=/; max-age=31536000; samesite=lax${secure}`;
    }
  }, []);

  const t = useCallback((key: string, params?: Record<string, string>) => translate(locale, key, params), [locale]);

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** Access translation + locale anywhere under the provider. */
export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
