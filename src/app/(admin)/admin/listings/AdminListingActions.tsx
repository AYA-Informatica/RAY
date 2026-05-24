"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

/** Remove / restore actions, posting to /api/admin. */
export function AdminListingActions({ listingId, status }: { listingId: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function act(action: "removeListing" | "restoreListing") {
    setBusy(true);
    try {
      await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, listingId }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex shrink-0 gap-2">
      {status === "REMOVED" ? (
        <Button size="sm" variant="secondary" loading={busy} onClick={() => act("restoreListing")}>
          Restore
        </Button>
      ) : (
        <Button size="sm" variant="danger" loading={busy} onClick={() => act("removeListing")}>
          Remove
        </Button>
      )}
    </div>
  );
}
