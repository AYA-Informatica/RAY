import { AppShell } from "@/components/layout/AppShell";
import { SafetyContent } from "@/app/profile/safety/SafetyContent";
import { serverT } from "@/i18n/server";

export const metadata = { title: "Safety Tips — RAY" };

/** Public safety-tips page — no auth required (mirrors /privacy). */
export default async function PublicSafetyPage() {
  return (
    <AppShell>
      <header className="border-b border-border px-4 py-4">
        <h1 className="font-display text-xl font-bold">{await serverT("profile.safety")}</h1>
      </header>
      <SafetyContent />
    </AppShell>
  );
}
