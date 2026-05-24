import { Star } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { SubPageHeader } from "../SubPageHeader";

export const metadata = { title: "Reviews & Ratings" };

export default function ReviewsPage() {
  return (
    <AppShell>
      <SubPageHeader titleKey="profile.reviews" fallback="Reviews & Ratings" />
      <EmptyState
        icon={<Star size={36} />}
        title="Reviews are coming soon"
        description="Seller ratings and reviews will arrive in a future update. For now, trust is built through activity and response speed."
      />
    </AppShell>
  );
}
