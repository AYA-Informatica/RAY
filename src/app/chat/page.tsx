import { redirect } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConversationList } from "@/components/chat/ConversationList";
import { getCurrentUser } from "@/lib/auth/session";
import { getInbox } from "@/services/chat";

export const metadata = { title: "Messages" };

/** Messages inbox. Auth required. */
export default async function ChatInboxPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/chat");

  const conversations = await getInbox(user.id);

  return (
    <AppShell>
      <header className="border-b border-border px-4 py-4">
        <h1 className="font-display text-2xl font-bold">Messages</h1>
      </header>
      {conversations.length === 0 ? (
        <EmptyState
          icon={<MessageCircle size={36} />}
          title="No messages yet"
          description="When you chat with a seller about a listing, it'll show up here."
        />
      ) : (
        <ConversationList conversations={conversations} />
      )}
    </AppShell>
  );
}
