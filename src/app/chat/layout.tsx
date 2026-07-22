import { TopNav } from "@/components/layout/TopNav";
import { ChatMobileFrame } from "./ChatMobileFrame";
import { PresenceHeartbeat } from "@/components/shared/PresenceHeartbeat";
import { UnreadMessagesProvider } from "@/components/shared/UnreadMessagesProvider";
import { InboxRealtimeSync } from "@/components/shared/InboxRealtimeSync";
import { ConversationList } from "@/components/chat/ConversationList";
import { getAuthUser, getCurrentUser } from "@/lib/auth/session";
import { getUnreadCount } from "@/lib/chat/getUnreadCount";
import { getInbox } from "@/services/chat";
import { getUnreadNotificationCount } from "@/services/notifications";
import { serverT } from "@/i18n/server";
import { logger } from "@/lib/logger";

/**
 * Chat shell — replaces the generic AppShell for the /chat route tree.
 *
 * Mobile / tablet (< lg):
 *   Full-screen single-column, children render as pages (inbox or thread).
 *
 * Desktop (lg+):
 *   Two-pane layout — inbox sidebar on the left, active thread on the right.
 *   Sidebar stays visible while navigating between conversations.
 */
export default async function ChatLayout({ children }: { children: React.ReactNode }) {
  logger.debug("[ChatLayout] rendering");
  const authUser = await getAuthUser();
  const [unread, unreadNotifications] = authUser
    ? await Promise.all([getUnreadCount(authUser.id), getUnreadNotificationCount(authUser.id)])
    : [0, 0];

  const user = await getCurrentUser();
  const conversations = user ? await getInbox(user.id) : [];
  logger.debug({ hasUser: !!user, unread, conversationCount: conversations.length }, "[ChatLayout] data loaded");

  return (
    <ChatMobileFrame unreadMessages={unread}>
      <a
        href="#chat-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-text-primary"
      >
        Skip to content
      </a>
      <PresenceHeartbeat />
      {authUser && <UnreadMessagesProvider initialCount={unread} userId={authUser.id} />}
      {authUser && <InboxRealtimeSync userId={authUser.id} />}
      <TopNav unreadMessages={unread} unreadNotifications={unreadNotifications} />

      {/* Below the sticky TopNav (h-16 = 64px) on desktop */}
      <div
        id="chat-main"
        className="flex w-full lg:h-[calc(100dvh-64px)] lg:overflow-hidden"
      >
        {/* Desktop sidebar — hidden on mobile */}
        <aside className="hidden w-80 shrink-0 flex-col border-r border-border lg:flex xl:w-96">
          <div className="shrink-0 border-b border-border px-4 py-4">
            <h1 className="font-display text-xl font-bold">{await serverT("chat.title")}</h1>
            <p className="mt-0.5 text-xs text-text-muted">{await serverT("chat.emptySub")}</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ConversationList conversations={conversations} currentUserId={user?.id ?? ""} />
          </div>
        </aside>

        {/* Right pane — full width on mobile, flex-1 on desktop */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </ChatMobileFrame>
  );
}
