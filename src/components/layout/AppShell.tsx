import { BottomNav } from "./BottomNav";
import { TopNav } from "./TopNav";
import { PresenceHeartbeat } from "@/components/shared/PresenceHeartbeat";
import { UnreadMessagesProvider } from "@/components/shared/UnreadMessagesProvider";
import { FavoritesProvider } from "@/components/shared/FavoritesProvider";
import { cn } from "@/lib/utils/cn";
import { getAuthUser } from "@/lib/auth/session";
import { getUnreadCount } from "@/lib/chat/getUnreadCount";
import { getFavoriteIds } from "@/services/favorites";

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
  const [unread, favoriteIds] = await Promise.all([
    authUser ? getUnreadCount(authUser.id) : Promise.resolve(0),
    authUser ? getFavoriteIds(authUser.id) : Promise.resolve([]),
  ]);

  return (
    <div className="min-h-dvh bg-background pb-24 mouse-lg:pb-12">
      {/* Skip to content — keyboard accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-text-primary"
      >
        Skip to content
      </a>
      <PresenceHeartbeat />
      {authUser && <UnreadMessagesProvider initialCount={unread} userId={authUser.id} />}
      {authUser && <FavoritesProvider initialIds={favoriteIds} />}
      <TopNav unreadMessages={unread} />
      <main id="main-content" className={cn("mx-auto w-full", width === "wide" ? "max-w-6xl" : "max-w-2xl")}>
        {children}
      </main>
      <BottomNav unreadMessages={unread} />
    </div>
  );
}
