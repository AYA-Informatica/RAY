import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { sendMessageSchema, respondOfferSchema } from "@/lib/validations/message.schema";
import { sanitizeText } from "@/lib/sanitization/sanitize";
import { ok, fail, handleApiError, RATE_LIMITED } from "@/lib/utils/api";
import { limiters, checkLimit } from "@/lib/ratelimit";

/** Verifies the user is a participant in the conversation. */
async function assertParticipant(conversationId: string, userId: string) {
  const convo = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { buyerId: true, sellerId: true },
  });
  if (!convo) return null;
  if (convo.buyerId !== userId && convo.sellerId !== userId) return null;
  const otherId = convo.buyerId === userId ? convo.sellerId : convo.buyerId;
  return { ...convo, otherId };
}

/** True if a block exists in EITHER direction between two users. */
async function isBlockedBetween(a: string, b: string): Promise<boolean> {
  const block = await prisma.block.findFirst({
    where: {
      OR: [
        { blockerId: a, blockedId: b },
        { blockerId: b, blockedId: a },
      ],
    },
    select: { id: true },
  });
  return Boolean(block);
}

/** GET /api/chat/messages?conversationId=… — messages, marks incoming as read. */
export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const conversationId = req.nextUrl.searchParams.get("conversationId");
    if (!conversationId) return fail("conversationId required", 400);

    if (!(await assertParticipant(conversationId, user.id))) return fail("Forbidden", 403);

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      take: 200,
    });

    await prisma.message.updateMany({
      where: { conversationId, isRead: false, NOT: { senderId: user.id } },
      data: { isRead: true },
    });

    return ok(messages);
  } catch (err) {
    return handleApiError(err);
  }
}

/** POST /api/chat/messages — send a message (participant-checked, rate limited). */
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    if (!(await checkLimit(limiters.chatSend, user.id))) return RATE_LIMITED();

    const data = sendMessageSchema.parse(await req.json());
    const convo = await assertParticipant(data.conversationId, user.id);
    if (!convo) return fail("Forbidden", 403);

    if (await isBlockedBetween(user.id, convo.otherId)) {
      return fail("You can't message this user.", 403, "BLOCKED");
    }

    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId: data.conversationId,
          senderId: user.id,
          content: data.content ? sanitizeText(data.content) : null,
          imageUrl: data.imageUrl ?? null,
          latitude: data.latitude ?? null,
          longitude: data.longitude ?? null,
        },
      }),
      prisma.conversation.update({
        where: { id: data.conversationId },
        data: { updatedAt: new Date() },
      }),
    ]);

    // Offer fields are new schema columns not yet in the generated Prisma client.
    // Write them via a raw update so the stale types stay satisfied.
    if (data.offerAmount != null) {
      await prisma.$executeRaw`
        UPDATE "Message"
        SET "offerAmount" = ${data.offerAmount}, "offerStatus" = 'pending'
        WHERE id = ${message.id}
      `;
    }

    return ok(message, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * PATCH /api/chat/messages — seller responds to a price offer (accept/decline).
 * Only the conversation seller can respond; only pending offers can be updated.
 */
export async function PATCH(req: NextRequest) {
  try {
    const user = await requireUser();
    const data = respondOfferSchema.parse(await req.json());

    const message = await prisma.message.findUnique({
      where: { id: data.messageId },
      include: { conversation: { select: { sellerId: true, buyerId: true } } },
    });
    if (!message) return fail("Message not found", 404);

    // offerStatus is a new column not in the stale Prisma client — read via raw query.
    const offerRows = await prisma.$queryRaw<{ offerStatus: string | null }[]>`
      SELECT "offerStatus" FROM "Message" WHERE id = ${data.messageId}
    `;
    if (offerRows[0]?.offerStatus !== "pending") return fail("Offer already responded to", 400);

    // Only the seller can respond to an offer.
    if (message.conversation.sellerId !== user.id) return fail("Forbidden", 403);

    await prisma.$executeRaw`
      UPDATE "Message" SET "offerStatus" = ${data.status} WHERE id = ${data.messageId}
    `;
    return ok({ id: data.messageId, offerStatus: data.status });
  } catch (err) {
    return handleApiError(err);
  }
}
