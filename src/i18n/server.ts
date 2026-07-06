import { cookies } from "next/headers";
import { translate } from "./dictionaries";
import { parseLocale } from "./utils";
import { logger } from "@/lib/logger";

/**
 * Server-Component translate. Reads the `ray_locale` cookie that the
 * client-side I18nProvider writes on language change, falls back to "en".
 * Use this in async Server Components instead of `useI18n()`.
 */
export async function serverT(key: string): Promise<string> {
  const raw = (await cookies()).get("ray_locale")?.value;
  const locale = parseLocale(raw);
  logger.debug({ locale, key }, "[serverT] called");
  return translate(locale, key);
}
