import { BottomNav } from "./BottomNav";
import { TopNav } from "./TopNav";
import { PresenceHeartbeat } from "@/components/shared/PresenceHeartbeat";
import { cn } from "@/lib/utils/cn";
import { getAuthUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

async function getUnreadCount(userId: string): Promise<number> {
  try {
    return await prisma.message.count({
      where: {
        isRead: false,
        NOT: { senderId: userId },
        conversation: { OR: [{ buyerId: userId }, { sellerId: userId }] },
      },
    });
  } catch {
    return 0;
  }
}

/**
 * Responsive marketplace shell.
 *  - Mobile / tablet (< lg): full-width column + fixed BottomNav with unread badge.
 *  - Laptop / desktop (lg+): sticky TopNav, BottomNav hidden.
 *
 * `width`:
 *  - "wide"    → feed / search / favourites (max-w-6xl)
 *  - "reading" → account, settings, inbox, list screens (max-w-2xl)
 */
export async function AppShell({
  children,
  width = "reading",
}: {
  children: React.ReactNode;
  width?: "wide" | "reading";
}) {
  const authUser = await getAuthUser();
  const unread = authUser ? await getUnreadCount(authUser.id) : 0;

  return (
    <div className="min-h-dvh bg-background pb-24 lg:pb-12">
      {/* Skip to content — keyboard accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-text-primary"
      >
        Skip to content
      </a>
      <PresenceHeartbeat />
      <TopNav unreadMessages={unread} />
      <div id="main-content" className={cn("mx-auto w-full", width === "wide" ? "max-w-6xl" : "max-w-2xl")}>
        {children}
      </div>
      <BottomNav unreadMessages={unread} />
    </div>
  );
}
