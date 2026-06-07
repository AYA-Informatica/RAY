import { redirect } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConversationList } from "@/components/chat/ConversationList";
import { getCurrentUser } from "@/lib/auth/session";
import { getInbox } from "@/services/chat";
import { serverT } from "@/i18n/server";

export const metadata = { title: "Messages" };

/** Messages inbox. Auth required. */
export default async function ChatInboxPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/chat");

  const conversations = await getInbox(user.id);

  return (
    <>
      {/* Mobile / tablet — full-screen inbox list (layout sidebar is hidden) */}
      <div className="lg:hidden">
        <header className="border-b border-border px-4 py-4">
          <h1 className="font-display text-2xl font-bold">{serverT("chat.title")}</h1>
          <p className="mt-0.5 text-xs text-text-muted">{serverT("chat.emptySub")}</p>
        </header>
        {conversations.length === 0 ? (
          <EmptyState
            icon={<MessageCircle size={36} />}
            title={serverT("chat.empty")}
            description={serverT("chat.emptySub")}
          />
        ) : (
          <ConversationList conversations={conversations} />
        )}
      </div>

      {/* Desktop — right pane placeholder when no conversation is open */}
      <div className="hidden flex-1 flex-col items-center justify-center gap-3 text-center lg:flex">
        <MessageCircle size={40} className="text-text-muted opacity-40" />
        <p className="font-medium text-text-secondary">{serverT("chat.selectConversation")}</p>
        <p className="text-sm text-text-muted">{serverT("chat.selectHint")}</p>
      </div>
    </>
  );
}
