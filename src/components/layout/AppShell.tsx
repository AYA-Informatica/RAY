import { BottomNav } from "./BottomNav";
import { PresenceHeartbeat } from "@/components/shared/PresenceHeartbeat";

/** Wraps marketplace pages: centered mobile-first column + bottom nav padding. */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-dvh max-w-md bg-background pb-24">
      <PresenceHeartbeat />
      {children}
      <BottomNav />
    </div>
  );
}
