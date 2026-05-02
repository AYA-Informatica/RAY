"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToUser = sendToUser;
exports.notifyNewMessage = notifyNewMessage;
exports.notifyListingMilestone = notifyListingMilestone;
exports.notifyListingExpiring = notifyListingExpiring;
const firebase_1 = require("./firebase");
const User_1 = require("../models/User");
/**
 * Send a push notification to a single user by their userId (MongoDB _id).
 * Silently skips if user has no FCM token or notifications disabled.
 */
async function sendToUser(userId, opts) {
    const user = await User_1.User.findById(userId).select('fcmToken settings').lean();
    if (!user?.fcmToken)
        return;
    try {
        await firebase_1.messaging.send({
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
        });
    }
    catch (err) {
        // Token invalid — clear it
        if (err instanceof Error && err.message.includes('registration-token-not-registered')) {
            await User_1.User.findByIdAndUpdate(userId, { $unset: { fcmToken: 1 } });
        }
        console.warn('[FCM] Failed to send notification:', err);
    }
}
/**
 * Notify a user about a new chat message.
 */
async function notifyNewMessage(recipientId, senderName, messagePreview, conversationId) {
    await sendToUser(recipientId, {
        title: senderName,
        body: messagePreview.slice(0, 100),
        data: { type: 'new_message', conversationId },
    });
}
/**
 * Notify a seller when their listing gets a view milestone.
 */
async function notifyListingMilestone(sellerId, listingTitle, views, listingId) {
    await sendToUser(sellerId, {
        title: '🔥 Your listing is getting attention!',
        body: `"${listingTitle}" just hit ${views} views.`,
        data: { type: 'listing_activity', listingId },
    });
}
/**
 * Notify a user when their listing is about to expire.
 */
async function notifyListingExpiring(sellerId, listingTitle, listingId) {
    await sendToUser(sellerId, {
        title: '⏰ Listing expiring soon',
        body: `"${listingTitle}" expires in 24 hours. Renew it to keep getting buyers.`,
        data: { type: 'listing_expiring', listingId },
    });
}
//# sourceMappingURL=notificationService.js.map