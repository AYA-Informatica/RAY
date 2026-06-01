import { AppShell } from "@/components/layout/AppShell";
import { SubPageHeader } from "../SubPageHeader";
import { HelpContent } from "./HelpContent";

export const metadata = { title: "Help & Support" };

export default function HelpPage() {
  return (
    <AppShell>
      <SubPageHeader titleKey="profile.help" fallback="Help & Support" />
      <HelpContent />
    </AppShell>
  );
}
