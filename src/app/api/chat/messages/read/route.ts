import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { getUnreadCount } from "@/lib/chat/getUnreadCount";
import { ok, fail, handleApiError } from "@/lib/utils/api";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * POST /api/chat/messages/read — marks all incoming messages in a conversation
 * as read. Called by useRealtimeMessages when a new message arrives while the
 * user is actively in the thread, so the unread badge in the nav stays accurate.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const { conversationId } = (await req.json()) as { conversationId?: string };
    if (!conversationId) {
      logger.warn({ userId: user.id }, "[POST messages/read] rejected: conversationId required");
      return fail("conversationId required", 400);
    }
    logger.debug({ userId: user.id, conversationId }, "[POST messages/read] request received");

    const convo = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { buyerId: true, sellerId: true },
    });
    if (!convo) {
      logger.warn({ userId: user.id, conversationId }, "[POST messages/read] rejected: not found");
      return fail("Not found", 404);
    }
    if (convo.buyerId !== user.id && convo.sellerId !== user.id) {
      logger.warn({ userId: user.id, conversationId }, "[POST messages/read] rejected: forbidden");
      return fail("Forbidden", 403);
    }

    await prisma.message.updateMany({
      where: { conversationId, isRead: false, NOT: { senderId: user.id } },
      data: { isRead: true },
    });
    const unreadCount = await getUnreadCount(user.id);
    logger.debug({ userId: user.id, conversationId, unreadCount }, "[POST messages/read] success");
    return ok({ done: true, unreadCount });
  } catch (err) {
    logger.error({ err }, "[POST messages/read] ERROR");
    return handleApiError(err);
  }
}
