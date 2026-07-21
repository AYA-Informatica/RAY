import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { ConversationPreview } from "@/components/chat/ConversationList";

const inboxInclude = {
  listing: { include: { images: { take: 1 as const, orderBy: { order: "asc" as const } } } },
  buyer: { select: { id: true, name: true, avatarUrl: true, lastSeenAt: true } },
  seller: { select: { id: true, name: true, avatarUrl: true, lastSeenAt: true } },
  messages: { orderBy: { createdAt: "desc" as const }, take: 1 },
};

type InboxConversation = Awaited<ReturnType<typeof prisma.conversation.findFirstOrThrow<{ include: typeof inboxInclude }>>>;

/** Map a conversation (with its inbox includes) to a list preview for `userId`. */
function toPreview(c: InboxConversation, userId: string, unread: number): ConversationPreview {
  const other = c.buyerId === userId ? c.seller : c.buyer;
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
    otherId: other.id,
    otherName: other.name ?? "RAY user",
    otherAvatar: other.avatarUrl,
    otherLastSeenAt: other.lastSeenAt,
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
  logger.debug({ userId }, "[getInbox] called");
  const convos = await prisma.conversation.findMany({
    where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
    orderBy: { updatedAt: "desc" },
    include: inboxInclude,
  });

  const visible = convos.filter((c) => !isHiddenFor(c, userId));
  if (visible.length === 0) {
    logger.debug({ userId, count: 0 }, "[getInbox] result");
    return [];
  }

  const unreadCounts = await prisma.message.groupBy({
    by: ["conversationId"],
    where: {
      conversationId: { in: visible.map((c) => c.id) },
      isRead: false,
      NOT: { senderId: userId },
    },
    _count: { id: true },
  });
  const unreadMap = new Map(unreadCounts.map((r) => [r.conversationId, r._count.id]));

  logger.debug({ userId, count: visible.length }, "[getInbox] result");
  return visible.map((c) => toPreview(c, userId, unreadMap.get(c.id) ?? 0));
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
  logger.debug({ conversationId, userId }, "[getConversationPreview] called");
  const c = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: inboxInclude,
  });
  if (!c) {
    logger.debug({ conversationId, userId }, "[getConversationPreview] not found");
    return null;
  }
  if (c.buyerId !== userId && c.sellerId !== userId) {
    logger.debug({ conversationId, userId }, "[getConversationPreview] not a participant");
    return null;
  }
  if (isHiddenFor(c, userId)) {
    logger.debug({ conversationId, userId }, "[getConversationPreview] hidden for user");
    return null;
  }
  const other = c.buyerId === userId ? c.seller : c.buyer;
  const [unread, blocks] = await Promise.all([
    prisma.message.count({
      where: { conversationId: c.id, isRead: false, NOT: { senderId: userId } },
    }),
    prisma.block.findMany({
      where: {
        OR: [
          { blockerId: userId, blockedId: other.id },
          { blockerId: other.id, blockedId: userId },
        ],
      },
      select: { blockerId: true },
    }),
  ]);
  logger.debug({ conversationId, userId, unread }, "[getConversationPreview] result");
  return {
    ...toPreview(c, userId, unread),
    sellerId: c.sellerId,
    listingPrice: c.listing.price,
    blockedByMe: blocks.some((b) => b.blockerId === userId),
    blockedByOther: blocks.some((b) => b.blockerId === other.id),
  };
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
  blockedByMe: boolean;
  blockedByOther: boolean;
}

/**
 * Thread header + access check. Returns null if the conversation doesn't exist
 * or the user is not a participant (used to 404/redirect).
 */
export async function getThread(
  conversationId: string,
  userId: string,
): Promise<ThreadHeader | null> {
  logger.debug({ conversationId, userId }, "[getThread] called");
  const c = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      listing: { include: { images: { take: 1, orderBy: { order: "asc" } } } },
      buyer: { select: { id: true, name: true, avatarUrl: true, lastSeenAt: true } },
      seller: { select: { id: true, name: true, avatarUrl: true, lastSeenAt: true } },
    },
  });
  if (!c) {
    logger.debug({ conversationId, userId }, "[getThread] not found");
    return null;
  }
  if (c.buyerId !== userId && c.sellerId !== userId) {
    logger.debug({ conversationId, userId }, "[getThread] not a participant");
    return null;
  }
  const other = c.buyerId === userId ? c.seller : c.buyer;

  const blocks = await prisma.block.findMany({
    where: {
      OR: [
        { blockerId: userId, blockedId: other.id },
        { blockerId: other.id, blockedId: userId },
      ],
    },
    select: { blockerId: true },
  });
  const blockedByMe = blocks.some((b) => b.blockerId === userId);
  const blockedByOther = blocks.some((b) => b.blockerId === other.id);

  logger.debug({ conversationId, userId, blockedByMe, blockedByOther }, "[getThread] result");
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
    blockedByMe,
    blockedByOther,
  };
}

/**
 * Median first-reply time (minutes) for a seller over the last 30 days.
 * Returns undefined when there is no reply data yet.
 * Non-critical metric — errors are logged but do not crash the detail page.
 */
export async function getSellerResponseTime(sellerId: string): Promise<number | undefined> {
  logger.debug({ sellerId }, "[getSellerResponseTime] called");
  try {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const convIds = await prisma.conversation
      .findMany({ where: { sellerId, updatedAt: { gte: since } }, select: { id: true } })
      .then((rows) => rows.map((r) => r.id));
    if (convIds.length === 0) {
      logger.debug({ sellerId }, "[getSellerResponseTime] no recent conversations");
      return undefined;
    }

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

    if (intervals.length === 0) {
      logger.debug({ sellerId }, "[getSellerResponseTime] no reply data");
      return undefined;
    }
    intervals.sort((a, b) => a - b);
    const mid = Math.floor(intervals.length / 2);
    const result = intervals.length % 2 === 0
      ? Math.round((intervals[mid - 1]! + intervals[mid]!) / 2)
      : intervals[mid]!;
    logger.debug({ sellerId, responseTimeMins: result }, "[getSellerResponseTime] result");
    return result;
  } catch (err) {
    logger.error({ sellerId, error: err instanceof Error ? err.message : String(err) }, "getSellerResponseTime failed");
    return undefined;
  }
}
