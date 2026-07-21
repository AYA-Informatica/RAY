"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/i18n/I18nProvider";
import { logger } from "@/lib/logger";

/**
 * Anonymize-in-place account deletion — mirrors the mobile app's Settings
 * screen. Calls DELETE /api/users/[id] without ?permanent=true, matching
 * mobile's default (reversible scrub, not the irreversible Auth-identity
 * revocation also available on that endpoint).
 */
export function AccountDeletion({ userId }: { userId: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm(t("settings.deleteAccountConfirm"))) return;
    setDeleting(true);
    logger.debug({ userId }, "[AccountDeletion] delete requested");
    try {
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete account");
      logger.debug({ userId }, "[AccountDeletion] delete succeeded");
      await createClient().auth.signOut();
      router.push("/");
      router.refresh();
    } catch (err) {
      logger.warn({ userId, err }, "[AccountDeletion] delete failed");
      window.alert(t("settings.deleteAccountError"));
      setDeleting(false);
    }
  }

  return (
    <div>
      <p className="px-4 pb-2 pt-4 text-xs font-semibold uppercase tracking-wide text-text-muted">
        {t("settings.dangerZone")}
      </p>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-danger disabled:opacity-50"
      >
        <Trash2 size={20} />
        <span className="font-medium">{deleting ? t("common.loading") : t("settings.deleteAccount")}</span>
      </button>
    </div>
  );
}
