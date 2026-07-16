import { Expo, type ExpoPushMessage } from "expo-server-sdk";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

const expo = new Expo();

/**
 * Fire-and-forget push notification for a new chat message. Never throws —
 * a push failure must never fail the message-send API response.
 *
 * channelId "chat" must match the Android notification channel the mobile
 * app registers (RAY-Mobile/lib/notifications.ts, RAY-Mobile/app.config.ts).
 */
export async function sendChatPush(opts: {
  recipientId: string;
  senderName: string | null;
  content?: string | null;
  hasImage?: boolean;
  offerAmount?: number | null;
  conversationId: string;
}): Promise<void> {
  try {
    const recipient = await prisma.user.findUnique({
      where: { id: opts.recipientId },
      select: { pushToken: true },
    });
    const token = recipient?.pushToken;
    if (!token || !Expo.isExpoPushToken(token)) return;

    const body =
      opts.content?.slice(0, 100) ??
      (opts.hasImage
        ? "📷 Sent a photo"
        : opts.offerAmount != null
          ? `💰 Offer: Rwf ${opts.offerAmount.toLocaleString()}`
          : "New message");

    const message: ExpoPushMessage = {
      to: token,
      sound: "default",
      title: opts.senderName ?? "RAY",
      body,
      data: { conversationId: opts.conversationId },
      channelId: "chat",
    };

    const receipts = await expo.sendPushNotificationsAsync([message]);
    logger.debug({ conversationId: opts.conversationId, receipts }, "[push] chat notification sent");
  } catch (err) {
    logger.error({ err, conversationId: opts.conversationId }, "[push] sendChatPush failed");
  }
}
