import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export interface NotificationData {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: Date;
}

export async function getNotifications(userId: string, limit = 30): Promise<NotificationData[]> {
  logger.debug({ userId, limit }, "[getNotifications] called");
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { id: true, type: true, title: true, body: true, link: true, isRead: true, createdAt: true },
  });
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, isRead: false } });
}

export async function markNotificationsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
}

/** Fire-and-forget helper — never throws, so callers can use `void`. */
export async function createNotification(params: {
  userId: string;
  type: string;
  title: string;
  body?: string;
  link?: string;
}): Promise<void> {
  try {
    await prisma.notification.create({ data: params });
    logger.debug({ userId: params.userId, type: params.type }, "[createNotification] created");
  } catch (err) {
    logger.warn({ userId: params.userId, type: params.type, err }, "[createNotification] failed");
  }
}
