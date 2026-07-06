import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

/** Total unread messages across all of the user's conversations. */
export async function getUnreadCount(userId: string): Promise<number> {
  logger.debug({ userId }, "[getUnreadCount] fetching unread count");
  try {
    const count = await prisma.message.count({
      where: {
        isRead: false,
        NOT: { senderId: userId },
        conversation: { OR: [{ buyerId: userId }, { sellerId: userId }] },
      },
    });
    logger.debug({ userId, count }, "[getUnreadCount] fetched");
    return count;
  } catch (err) {
    console.error("[getUnreadCount] failed uid=", userId, err instanceof Error ? err.message : err);
    return 0;
  }
}
