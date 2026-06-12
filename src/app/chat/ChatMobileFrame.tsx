"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/layout/BottomNav";
import { cn } from "@/lib/utils/cn";

/**
 * Wraps the chat layout's outer shell. On mobile, an open thread
 * (/chat/[id]) is a full-screen view with its own sticky composer —
 * it doesn't need (and shouldn't have) the bottom-nav clearance padding
 * or the fixed BottomNav, which otherwise leaves empty scroll space and
 * floats over the composer.
 */
export function ChatMobileFrame({
  children,
  unreadMessages,
}: {
  children: React.ReactNode;
  unreadMessages: number;
}) {
  const pathname = usePathname();
  const isThread = pathname !== "/chat";

  return (
    <div className={cn("min-h-dvh bg-background lg:pb-0", !isThread && "pb-24")}>
      {children}
      {!isThread && <BottomNav unreadMessages={unreadMessages} />}
    </div>
  );
}
