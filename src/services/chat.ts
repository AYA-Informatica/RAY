import { prisma } from "@/lib/prisma";
import type { ConversationPreview } from "@/components/chat/ConversationList";

/** Build the inbox preview list for a user. */
export async function getInbox(userId: string): Promise<ConversationPreview[]> {
  try {
    const convos = await prisma.conversation.findMany({
      where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
      orderBy: { updatedAt: "desc" },
      include: {
        listing: { include: { images: { take: 1, orderBy: { order: "asc" } } } },
        buyer: { select: { id: true, name: true, avatarUrl: true } },
        seller: { select: { id: true, name: true, avatarUrl: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    return Promise.all(
      convos.map(async (c) => {
        const other = c.buyerId === userId ? c.seller : c.buyer;
        const unread = await prisma.message.count({
          where: { conversationId: c.id, isRead: false, NOT: { senderId: userId } },
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
  } catch {
    return [];
  }
}

export interface ThreadHeader {
  conversationId: string;
  listingId: string;
  listingTitle: string;
  listingImage: string | null;
  listingPrice: number;
  otherId: string;
  otherName: string;
  otherAvatar: string | null;
  otherLastSeenAt: string;
  isBlocked: boolean;
}

/**
 * Thread header + access check. Returns null if the conversation doesn't exist
 * or the user is not a participant (used to 404/redirect).
 */
export async function getThread(
  conversationId: string,
  userId: string,
): Promise<ThreadHeader | null> {
  try {
    const c = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        listing: { include: { images: { take: 1, orderBy: { order: "asc" } } } },
        buyer: { select: { id: true, name: true, avatarUrl: true, lastSeenAt: true } },
        seller: { select: { id: true, name: true, avatarUrl: true, lastSeenAt: true } },
      },
    });
    if (!c) return null;
    if (c.buyerId !== userId && c.sellerId !== userId) return null;
    const other = c.buyerId === userId ? c.seller : c.buyer;

    const block = await prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: userId, blockedId: other.id },
          { blockerId: other.id, blockedId: userId },
        ],
      },
      select: { id: true },
    });

    return {
      conversationId: c.id,
      listingId: c.listingId,
      listingTitle: c.listing.title,
      listingImage: c.listing.images[0]?.url ?? null,
      listingPrice: c.listing.price,
      otherId: other.id,
      otherName: other.name ?? "RAY user",
      otherAvatar: other.avatarUrl,
      otherLastSeenAt:
        other.lastSeenAt instanceof Date ? other.lastSeenAt.toISOString() : String(other.lastSeenAt),
      isBlocked: Boolean(block),
    };
  } catch {
    return null;
  }
}
