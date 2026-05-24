import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getThread } from "@/services/chat";
import { ChatThread } from "./ChatThread";

export const metadata = { title: "Chat" };

type Params = { params: { id: string } };

/** Single conversation thread. Auth + participant-checked. */
export default async function ChatThreadPage({ params }: Params) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?redirect=/chat/${params.id}`);

  const thread = await getThread(params.id, user.id);
  if (!thread) notFound();

  return <ChatThread thread={thread} currentUserId={user.id} />;
}
