import { messaging } from './firebase'
import { User } from '../models/User'

interface SendOptions {
  title: string
  body: string
  data?: Record<string, string>
  imageUrl?: string
}

/**
 * Send a push notification to a single user by their userId (MongoDB _id).
 * Silently skips if user has no FCM token or notifications disabled.
 */
export async function sendToUser(
  userId: string,
  opts: SendOptions
): Promise<void> {
  const user = await User.findById(userId).select('fcmToken settings').lean()
  if (!user?.fcmToken) return

  try {
    await messaging.send({
      token: user.fcmToken,
      notification: {
        title: opts.title,
        body: opts.body,
        imageUrl: opts.imageUrl,
      },
      data: opts.data ?? {},
      android: {
        priority: 'high',
        notification: { sound: 'default', clickAction: 'FLUTTER_NOTIFICATION_CLICK' },
      },
      apns: {
        payload: { aps: { sound: 'default', badge: 1 } },
      },
    })
  } catch (err: unknown) {
    // Token invalid — clear it
    if (err instanceof Error && err.message.includes('registration-token-not-registered')) {
      await User.findByIdAndUpdate(userId, { $unset: { fcmToken: 1 } })
    }
    console.warn('[FCM] Failed to send notification:', err)
  }
}

/**
 * Notify a user about a new chat message.
 */
export async function notifyNewMessage(
  recipientId: string,
  senderName: string,
  messagePreview: string,
  conversationId: string
): Promise<void> {
  await sendToUser(recipientId, {
    title: senderName,
    body: messagePreview.slice(0, 100),
    data: { type: 'new_message', conversationId },
  })
}

/**
 * Notify a seller when their listing gets a view milestone.
 */
export async function notifyListingMilestone(
  sellerId: string,
  listingTitle: string,
  views: number,
  listingId: string
): Promise<void> {
  await sendToUser(sellerId, {
    title: '🔥 Your listing is getting attention!',
    body: `"${listingTitle}" just hit ${views} views.`,
    data: { type: 'listing_activity', listingId },
  })
}

/**
 * Notify a user when their listing is about to expire.
 */
export async function notifyListingExpiring(
  sellerId: string,
  listingTitle: string,
  listingId: string
): Promise<void> {
  await sendToUser(sellerId, {
    title: '⏰ Listing expiring soon',
    body: `"${listingTitle}" expires in 24 hours. Renew it to keep getting buyers.`,
    data: { type: 'listing_expiring', listingId },
  })
}
