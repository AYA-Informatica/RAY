import * as functions from 'firebase-functions'
import { connectDB } from '../services/db'
import { User } from '../models/User'
import { Listing } from '../models/Listing'
import { db } from '../services/firebase'

/**
 * onMessageCreated — fires when a new message is written to Firestore.
 * Updates the parent conversation's lastMessage + updatedAt,
 * and tracks response rate for the seller.
 */
export const onMessageCreated = functions.firestore
  .document('messages/{messageId}')
  .onCreate(async (snap) => {
    const msg  = snap.data()
    const { conversationId, senderId } = msg as {
      conversationId: string
      senderId: string
    }

    const convoRef = db.collection('conversations').doc(conversationId)
    const convo    = await convoRef.get()
    if (!convo.exists) return

    const convoData = convo.data()!
    const now       = new Date().toISOString()

    // Update conversation metadata
    await convoRef.update({
      lastMessage: { ...msg, id: snap.id },
      updatedAt:   now,
    })

    // If seller is responding, track response rate
    if (senderId === convoData['sellerId']) {
      await connectDB()
      const user = await User.findOne({ firebaseUid: senderId }).lean()
      if (user) {
        // Rolling average: weight new response into existing rate
        const current = user.responseRate ?? 0
        const updated = Math.min(100, Math.round(current * 0.9 + 10))
        await User.findByIdAndUpdate(user._id, { responseRate: updated })
      }
    }
  })

/**
 * onUserCreated — fires when a new Firebase Auth user is created.
 * Seeds a minimal MongoDB user record automatically.
 */
export const onUserCreated = functions.auth.user().onCreate(async (fbUser) => {
  await connectDB()

  // Check if already exists (e.g. from /users/me endpoint race)
  const exists = await User.findOne({ firebaseUid: fbUser.uid })
  if (exists) return

  await User.create({
    firebaseUid:        fbUser.uid,
    phone:              fbUser.phoneNumber ?? '',
    displayName:        fbUser.displayName ?? 'RAY User',
    verificationStatus: 'phone',
    memberSince:        new Date(),
  })

  console.log(`[onUserCreated] Seeded user for ${fbUser.uid}`)
})

/**
 * onUserDeleted — fires when a Firebase Auth user is deleted.
 * Cleans up their MongoDB record and deactivates listings.
 */
export const onUserDeleted = functions.auth.user().onDelete(async (fbUser) => {
  await connectDB()

  const user = await User.findOne({ firebaseUid: fbUser.uid })
  if (!user) return

  await Promise.all([
    User.deleteOne({ firebaseUid: fbUser.uid }),
    Listing.updateMany({ 'seller.id': String(user._id) }, { status: 'expired' }),
  ])

  console.log(`[onUserDeleted] Cleaned up user ${fbUser.uid}`)
})
