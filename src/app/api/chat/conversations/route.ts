import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { startConversationSchema } from "@/lib/validations/message.schema";
import { ok, fail, handleApiError } from "@/lib/utils/api";
import { getInbox } from "@/services/chat";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/** GET /api/chat/conversations — the current user's inbox. */
export async function GET() {
  try {
    const user = await requireUser();
    logger.debug({ userId: user.id }, "[GET conversations] request received");
    const previews = await getInbox(user.id);
    logger.debug({ userId: user.id, count: previews.length }, "[GET conversations] success");
    return ok(previews);
  } catch (err) {
    logger.error({ err }, "[GET conversations] ERROR");
    return handleApiError(err);
  }
}

/** POST /api/chat/conversations — start or reuse a thread for a listing. */
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const { listingId } = startConversationSchema.parse(await req.json());
    logger.debug({ userId: user.id, listingId }, "[POST conversations] request received");

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, userId: true, user: { select: { isBanned: true } } },
    });
    if (!listing) {
      logger.warn({ userId: user.id, listingId }, "[POST conversations] rejected: listing not found");
      return fail("Listing not found", 404);
    }
    if (listing.userId === user.id) {
      logger.warn({ userId: user.id, listingId }, "[POST conversations] rejected: own listing");
      return fail("You can't chat on your own listing", 400);
    }
    if (listing.user.isBanned) {
      logger.warn({ userId: user.id, listingId }, "[POST conversations] rejected: seller banned");
      return fail("This seller is no longer active", 400);
    }

    const convo = await prisma.conversation.upsert({
      where: { listingId_buyerId: { listingId, buyerId: user.id } },
      update: {},
      create: { listingId, buyerId: user.id, sellerId: listing.userId },
      select: { id: true },
    });

    logger.debug({ userId: user.id, conversationId: convo.id }, "[POST conversations] success");
    return ok(convo, { status: 201 });
  } catch (err) {
    logger.error({ err }, "[POST conversations] ERROR");
    return handleApiError(err);
  }
}
