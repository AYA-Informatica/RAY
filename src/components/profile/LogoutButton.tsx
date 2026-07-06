"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/i18n/I18nProvider";
import { logger } from "@/lib/logger";

/** Signs out via Supabase and returns to the splash. */
export function LogoutButton() {
  const router = useRouter();
  const { t } = useI18n();
  async function logout() {
    logger.debug({}, "[LogoutButton] logout requested");
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      logger.warn({ err: error.message }, "[LogoutButton] sign out failed");
    } else {
      logger.debug({}, "[LogoutButton] sign out succeeded");
    }
    router.push("/");
    router.refresh();
  }
  return (
    <button
      onClick={logout}
      aria-label={t("profile.logout")}
      className="flex w-full items-center gap-3 px-4 py-3.5 text-primary"
    >
      <LogOut size={20} />
      <span className="font-medium">{t("profile.logout")}</span>
      <span className="ml-auto text-text-muted">›</span>
    </button>
  );
}
