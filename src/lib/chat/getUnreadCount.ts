import { prisma } from "@/lib/prisma";

/** Total unread messages across all of the user's conversations. */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    return await prisma.message.count({
      where: {
        isRead: false,
        NOT: { senderId: userId },
        conversation: { OR: [{ buyerId: userId }, { sellerId: userId }] },
      },
    });
  } catch {
    return 0;
  }
}
