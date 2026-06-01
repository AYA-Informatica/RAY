import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { PrivacyContent } from "./PrivacyContent";

export const metadata: Metadata = {
  title: "Privacy Policy — RAY",
  description: "How RAY protects your data and privacy.",
};

export default function PrivacyPage() {
  return (
    <AppShell>
      <PrivacyContent />
    </AppShell>
  );
}
