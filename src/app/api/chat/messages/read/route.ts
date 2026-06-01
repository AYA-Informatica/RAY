import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { ok, fail, handleApiError } from "@/lib/utils/api";

/**
 * POST /api/chat/messages/read — marks all incoming messages in a conversation
 * as read. Called by useRealtimeMessages when a new message arrives while the
 * user is actively in the thread, so the unread badge in the nav stays accurate.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const { conversationId } = (await req.json()) as { conversationId?: string };
    if (!conversationId) return fail("conversationId required", 400);

    const convo = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { buyerId: true, sellerId: true },
    });
    if (!convo) return fail("Not found", 404);
    if (convo.buyerId !== user.id && convo.sellerId !== user.id) return fail("Forbidden", 403);

    await prisma.message.updateMany({
      where: { conversationId, isRead: false, NOT: { senderId: user.id } },
      data: { isRead: true },
    });
    return ok({ done: true });
  } catch (err) {
    return handleApiError(err);
  }
}
