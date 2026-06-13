import { prisma } from "@/lib/prisma";
import type { ConversationPreview } from "@/components/chat/ConversationList";

const inboxInclude = {
  listing: { include: { images: { take: 1 as const, orderBy: { order: "asc" as const } } } },
  buyer: { select: { id: true, name: true, avatarUrl: true } },
  seller: { select: { id: true, name: true, avatarUrl: true } },
  messages: { orderBy: { createdAt: "desc" as const }, take: 1 },
};

type InboxConversation = Awaited<ReturnType<typeof prisma.conversation.findFirstOrThrow<{ include: typeof inboxInclude }>>>;

/** Map a conversation (with its inbox includes) to a list preview for `userId`. */
async function toPreview(c: InboxConversation, userId: string): Promise<ConversationPreview> {
  const other = c.buyerId === userId ? c.seller : c.buyer;
  const unread = await prisma.message.count({
    where: { conversationId: c.id, isRead: false, NOT: { senderId: userId } },
  });
  const last = c.messages[0];
  let lastMessage: string | null = null;
  let lastMessageType: ConversationPreview["lastMessageType"] = null;
  if (last) {
    if (last.content) {
      lastMessage = last.content;
      lastMessageType = "text";
    } else if (last.offerAmount != null) {
      lastMessageType = "offer";
    } else if (last.imageUrl) {
      lastMessageType = "image";
    } else if (last.latitude != null) {
      lastMessageType = "location";
    }
  }
  return {
    id: c.id,
    listingId: c.listingId,
    listingTitle: c.listing.title,
    listingImage: c.listing.images[0]?.url ?? null,
    listingStatus: c.listing.status,
    otherName: other.name ?? "RAY user",
    otherAvatar: other.avatarUrl,
    lastMessage,
    lastMessageType,
    lastAt: last?.createdAt ?? c.updatedAt,
    unread,
  };
}

/** A conversation is hidden for `userId` if they hid it and no newer message has arrived since. */
function isHiddenFor(
  c: { buyerId: string; sellerId: string; buyerHiddenAt: Date | null; sellerHiddenAt: Date | null; updatedAt: Date },
  userId: string,
): boolean {
  const hiddenAt = c.buyerId === userId ? c.buyerHiddenAt : c.sellerHiddenAt;
  return hiddenAt != null && hiddenAt >= c.updatedAt;
}

/** Build the inbox preview list for a user. */
export async function getInbox(userId: string): Promise<ConversationPreview[]> {
  const convos = await prisma.conversation.findMany({
    where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
    orderBy: { updatedAt: "desc" },
    include: inboxInclude,
  });

  return Promise.all(convos.filter((c) => !isHiddenFor(c, userId)).map((c) => toPreview(c, userId)));
}

/**
 * Build a single inbox preview for a conversation — used to fill in a row
 * that appears via Realtime (a brand-new conversation) without a full refetch.
 * Returns null if the conversation doesn't exist or `userId` isn't a participant.
 */
export async function getConversationPreview(
  conversationId: string,
  userId: string,
): Promise<ConversationPreview | null> {
  const c = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: inboxInclude,
  });
  if (!c) return null;
  if (c.buyerId !== userId && c.sellerId !== userId) return null;
  if (isHiddenFor(c, userId)) return null;
  return toPreview(c, userId);
}

export interface ThreadHeader {
  conversationId: string;
  listingId: string;
  listingTitle: string;
  listingImage: string | null;
  listingPrice: number;
  sellerId: string;
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
    sellerId: c.sellerId,
    otherId: other.id,
    otherName: other.name ?? "RAY user",
    otherAvatar: other.avatarUrl,
    otherLastSeenAt:
      other.lastSeenAt instanceof Date ? other.lastSeenAt.toISOString() : String(other.lastSeenAt),
    isBlocked: Boolean(block),
  };
}

/**
 * Median first-reply time (minutes) for a seller over the last 30 days.
 * Returns undefined when there is no reply data yet.
 * Non-critical metric — errors are logged but do not crash the detail page.
 */
export async function getSellerResponseTime(sellerId: string): Promise<number | undefined> {
  try {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const convIds = await prisma.conversation
      .findMany({ where: { sellerId, updatedAt: { gte: since } }, select: { id: true } })
      .then((rows) => rows.map((r) => r.id));
    if (convIds.length === 0) return undefined;

    const messages = await prisma.message.findMany({
      where: { conversationId: { in: convIds } },
      orderBy: { createdAt: "asc" },
      select: { conversationId: true, senderId: true, createdAt: true },
    });

    const byConv = new Map<string, typeof messages>();
    for (const m of messages) {
      if (!byConv.has(m.conversationId)) byConv.set(m.conversationId, []);
      byConv.get(m.conversationId)!.push(m);
    }

    const intervals: number[] = [];
    for (const msgs of byConv.values()) {
      const firstBuyer = msgs.find((m) => m.senderId !== sellerId);
      if (!firstBuyer) continue;
      const firstSellerReply = msgs.find(
        (m) => m.senderId === sellerId && m.createdAt > firstBuyer.createdAt,
      );
      if (!firstSellerReply) continue;
      intervals.push(
        Math.round(
          (firstSellerReply.createdAt.getTime() - firstBuyer.createdAt.getTime()) / 60000,
        ),
      );
    }

    if (intervals.length === 0) return undefined;
    intervals.sort((a, b) => a - b);
    const mid = Math.floor(intervals.length / 2);
    return intervals.length % 2 === 0
      ? Math.round((intervals[mid - 1]! + intervals[mid]!) / 2)
      : intervals[mid]!;
  } catch (err) {
    console.error("[getSellerResponseTime] error sellerId=", sellerId, err instanceof Error ? err.message : err);
    return undefined;
  }
}
