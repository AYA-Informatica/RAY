import { AppShell } from "@/components/layout/AppShell";
import { SubPageHeader } from "../SubPageHeader";
import { SafetyContent } from "./SafetyContent";

export const metadata = { title: "Safety Tips" };

export default function SafetyTipsPage() {
  return (
    <AppShell>
      <SubPageHeader titleKey="profile.safety" fallback="Safety Tips" />
      <SafetyContent />
    </AppShell>
  );
}
