"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function BanUserButton({ userId, banned }: { userId: string; banned: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <Button
      size="sm"
      variant={banned ? "secondary" : "danger"}
      loading={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await fetch("/api/admin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: banned ? "unbanUser" : "banUser", userId }),
          });
          router.refresh();
        } finally {
          setBusy(false);
        }
      }}
    >
      {banned ? "Unban" : "Ban"}
    </Button>
  );
}
