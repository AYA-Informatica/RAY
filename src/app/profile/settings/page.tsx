import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { SubPageHeader } from "../SubPageHeader";
import { getCurrentUser } from "@/lib/auth/session";
import { logger } from "@/lib/logger";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  logger.debug("[SettingsPage] rendering");
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/profile/settings");

  return (
    <AppShell>
      <SubPageHeader titleKey="profile.settings" fallback="Settings" />
      <div className="divide-y divide-border border-b border-border">
        <div className="px-4 py-3.5">
          <p className="text-xs text-text-muted">Signed in as</p>
          <p className="font-medium text-text-primary">{user.email}</p>
        </div>
        <LanguageToggle />
      </div>
      <p className="px-4 py-4 text-sm text-text-secondary">
        More settings (notifications, privacy) arrive in a future update.
      </p>
    </AppShell>
  );
}
