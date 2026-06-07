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
  console.log("[POST messages/read] start");
  try {
    const user = await requireUser();
    const { conversationId } = (await req.json()) as { conversationId?: string };
    if (!conversationId) return fail("conversationId required", 400);
    console.log("[POST messages/read] uid=", user.id, "conversationId=", conversationId);

    const convo = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { buyerId: true, sellerId: true },
    });
    if (!convo) {
      console.warn("[POST messages/read] conversation not found:", conversationId);
      return fail("Not found", 404);
    }
    if (convo.buyerId !== user.id && convo.sellerId !== user.id) {
      console.warn("[POST messages/read] forbidden uid=", user.id, "convo=", conversationId);
      return fail("Forbidden", 403);
    }

    const result = await prisma.message.updateMany({
      where: { conversationId, isRead: false, NOT: { senderId: user.id } },
      data: { isRead: true },
    });
    console.log("[POST messages/read] marked", result.count, "messages read");
    return ok({ done: true });
  } catch (err) {
    console.error("[POST messages/read] ERROR:", err instanceof Error ? err.message : err);
    return handleApiError(err);
  }
}
