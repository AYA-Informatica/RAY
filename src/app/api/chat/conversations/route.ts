import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { startConversationSchema } from "@/lib/validations/message.schema";
import { ok, fail, handleApiError } from "@/lib/utils/api";
import type { ConversationPreview } from "@/components/chat/ConversationList";

/** GET /api/chat/conversations — the current user's inbox. */
export async function GET() {
  console.log("[GET conversations] start");
  try {
    const user = await requireUser();
    const convos = await prisma.conversation.findMany({
      where: { OR: [{ buyerId: user.id }, { sellerId: user.id }] },
      orderBy: { updatedAt: "desc" },
      include: {
        listing: { include: { images: { take: 1, orderBy: { order: "asc" } } } },
        buyer: { select: { id: true, name: true, avatarUrl: true } },
        seller: { select: { id: true, name: true, avatarUrl: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });
    console.log("[GET conversations] found", convos.length, "conversations for uid=", user.id);

    const previews: ConversationPreview[] = await Promise.all(
      convos.map(async (c) => {
        const other = c.buyerId === user.id ? c.seller : c.buyer;
        const unread = await prisma.message.count({
          where: { conversationId: c.id, isRead: false, NOT: { senderId: user.id } },
        });
        const last = c.messages[0];
        return {
          id: c.id,
          listingTitle: c.listing.title,
          listingImage: c.listing.images[0]?.url ?? null,
          otherName: other.name ?? "RAY user",
          otherAvatar: other.avatarUrl,
          lastMessage: last?.content ?? (last?.imageUrl ? "📷 Photo" : null),
          lastAt: last?.createdAt ?? c.updatedAt,
          unread,
        };
      }),
    );

    console.log("[GET conversations] returning", previews.length, "previews");
    return ok(previews);
  } catch (err) {
    console.error("[GET conversations] ERROR:", err instanceof Error ? err.message : err);
    return handleApiError(err);
  }
}

/** POST /api/chat/conversations — start or reuse a thread for a listing. */
export async function POST(req: NextRequest) {
  console.log("[POST conversations] start");
  try {
    const user = await requireUser();
    const { listingId } = startConversationSchema.parse(await req.json());
    console.log("[POST conversations] uid=", user.id, "listingId=", listingId);

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, userId: true },
    });
    if (!listing) {
      console.warn("[POST conversations] listing not found:", listingId);
      return fail("Listing not found", 404);
    }
    if (listing.userId === user.id) {
      console.warn("[POST conversations] user tried to chat on own listing");
      return fail("You can't chat on your own listing", 400);
    }

    const convo = await prisma.conversation.upsert({
      where: { listingId_buyerId: { listingId, buyerId: user.id } },
      update: {},
      create: { listingId, buyerId: user.id, sellerId: listing.userId },
      select: { id: true },
    });

    console.log("[POST conversations] upsert OK convoId=", convo.id);
    return ok(convo, { status: 201 });
  } catch (err) {
    console.error("[POST conversations] ERROR:", err instanceof Error ? err.message : err);
    return handleApiError(err);
  }
}
