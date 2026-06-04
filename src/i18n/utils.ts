import { LOCALES, type Locale } from "./dictionaries";

/** Server helper: parse the locale cookie value safely. */
export function parseLocale(raw: string | undefined): Locale {
  return LOCALES.includes(raw as Locale) ? (raw as Locale) : "en";
}
