"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * Sticky "Chat with Seller" bar on the listing detail page.
 * Starts (or reuses) a conversation, then routes to the thread.
 * Auth is enforced by middleware — unauthenticated users are sent to /login.
 */
export function ChatCtaBar({ listingId, sellerName }: { listingId: string; sellerName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function startChat() {
    setLoading(true);
    try {
      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      if (res.status === 401) {
        router.push(`/login?redirect=/listing/${listingId}`);
        return;
      }
      const json = (await res.json()) as { data?: { id: string } };
      if (json.data?.id) router.push(`/chat/${json.data.id}`);
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-border bg-background/95 p-3 backdrop-blur">
      <Button fullWidth size="lg" loading={loading} onClick={startChat}>
        <MessageCircle size={20} /> Chat with {sellerName.split(" ")[0]}
      </Button>
    </div>
  );
}
