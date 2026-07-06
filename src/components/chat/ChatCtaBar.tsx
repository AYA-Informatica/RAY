"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { logger } from "@/lib/logger";

/**
 * Sticky "Chat with Seller" bar on the listing detail page.
 * Starts (or reuses) a conversation, then routes to the thread.
 * Auth is enforced by middleware — unauthenticated users are sent to /login.
 */
export function ChatCtaBar({
  listingId,
  sellerName,
  inline = false,
}: {
  listingId: string;
  sellerName: string;
  inline?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function startChat() {
    setLoading(true);
    logger.debug({ listingId }, "[ChatCtaBar] start chat requested");
    try {
      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      if (res.status === 401) {
        logger.debug({ listingId }, "[ChatCtaBar] unauthenticated, redirecting to login");
        router.push(`/login?redirect=/listing/${listingId}`);
        return;
      }
      const json = (await res.json()) as { data?: { id: string } };
      if (json.data?.id) {
        logger.debug({ listingId, conversationId: json.data.id }, "[ChatCtaBar] conversation ready");
        router.push(`/chat/${json.data.id}`);
        return;
      }
      logger.warn({ listingId, status: res.status }, "[ChatCtaBar] start chat returned no conversation");
      setLoading(false);
    } catch (err) {
      logger.error({ listingId, err }, "[ChatCtaBar] start chat failed");
      setLoading(false);
    }
  }

  const button = (
    <Button fullWidth size="lg" loading={loading} onClick={startChat}>
      <MessageCircle size={20} /> Chat with {sellerName.split(" ")[0]}
    </Button>
  );

  // Desktop: rendered in-flow inside the listing info column.
  if (inline) return button;

  // Mobile/tablet: sticky action bar pinned to the bottom of the viewport.
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-border bg-background/95 p-3 backdrop-blur lg:hidden">
      {button}
    </div>
  );
}
