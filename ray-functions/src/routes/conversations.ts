import { Router } from 'express'
import { z } from 'zod'
import { db } from '../services/firebase'
import { Listing } from '../models/Listing'
import { User } from '../models/User'
import { requireAuth, type AuthRequest } from '../middleware/auth'
import { ok, created, notFound, badRequest } from '../utils/response'
import { notifyNewMessage } from '../services/notificationService'
import { connectDB } from '../services/db'
import { debugLog, debugWarn } from '../utils/debug'

const router = Router()

// ─────────────────────────────────────────────
// GET /conversations  — list all for current user
// ─────────────────────────────────────────────
router.get('/', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const snap = await db.collection('conversations')
      .where('participants', 'array-contains', req.userId)
      .orderBy('updatedAt', 'desc')
      .limit(50)
      .get()

    const convos = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    debugLog('conversations.list', 'Fetched conversations', {
      userId: req.userId,
      count: convos.length,
    })
    ok(res, convos)
  } catch (err) { next(err) }
})

// ─────────────────────────────────────────────
// GET /conversations/:id
// ─────────────────────────────────────────────
router.get('/:id', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const doc = await db.collection('conversations').doc(req.params['id']).get()
    if (!doc.exists) { notFound(res, 'Conversation not found'); return }

    const data = doc.data()!
    if (!data['participants'].includes(req.userId)) {
      debugWarn('conversations.getById', 'Blocked non-participant access', {
        conversationId: req.params['id'],
        userId: req.userId,
      })
      res.status(403).json({ success: false, message: 'Not a participant' }); return
    }
    debugLog('conversations.getById', 'Fetched conversation', {
      conversationId: req.params['id'],
      userId: req.userId,
    })

    ok(res, { id: doc.id, ...data })
  } catch (err) { next(err) }
})

// ─────────────────────────────────────────────
// POST /conversations  — start or retrieve conversation for a listing
// ─────────────────────────────────────────────
router.post('/', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    await connectDB()

    const schema = z.object({ listingId: z.string().min(1) })
    const { listingId } = schema.parse(req.body)
    debugLog('conversations.start', 'Start conversation request', {
      userId: req.userId,
      listingId,
    })

    const listing = await Listing.findById(listingId).lean()
    if (!listing) { notFound(res, 'Listing not found'); return }
    if (String(listing.seller.id) === req.userId) {
      badRequest(res, 'Cannot start a conversation on your own listing'); return
    }

    const buyerId  = req.userId!
    const sellerId = listing.seller.id

    // Check if conversation already exists
    const existing = await db.collection('conversations')
      .where('listingId', '==', listingId)
      .where('participants', 'array-contains', buyerId)
      .limit(1)
      .get()

    if (!existing.empty) {
      const doc = existing.docs[0]
      debugLog('conversations.start', 'Returning existing conversation', {
        conversationId: doc.id,
        listingId,
        userId: req.userId,
      })
      ok(res, { id: doc.id, ...doc.data() }); return
    }

    // Get buyer profile
    const buyer = await User.findOne({ firebaseUid: req.firebaseUid })
      .select('displayName avatar')
      .lean()

    // Create new conversation in Firestore
    const convoRef = db.collection('conversations').doc()
    const now      = new Date().toISOString()

    const convoData = {
      listingId,
      listingSnapshot: {
        title:      listing.title,
        price:      listing.price,
        coverImage: listing.coverImage,
      },
      participants: [buyerId, sellerId],
      buyerId,
      sellerId,
      otherUser: {          // from the buyer's perspective
        id:          sellerId,
        displayName: listing.seller.displayName,
        avatar:      listing.seller.avatar ?? null,
        trustLevel:  listing.seller.trustLevel,
        verificationStatus: listing.seller.verificationStatus,
      },
      buyerInfo: {
        id:          buyerId,
        displayName: buyer?.displayName ?? 'Buyer',
        avatar:      buyer?.avatar ?? null,
      },
      lastMessage:  null,
      unreadCount:  0,
      updatedAt:    now,
      createdAt:    now,
    }

    await convoRef.set(convoData)

    // Update listing chat count
    await Listing.findByIdAndUpdate(listingId, { $inc: { chatCount: 1 } })
    debugLog('conversations.start', 'Created conversation', {
      conversationId: convoRef.id,
      listingId,
      buyerId,
      sellerId,
    })

    created(res, { id: convoRef.id, ...convoData })
  } catch (err) { next(err) }
})

// ─────────────────────────────────────────────
// GET /conversations/:id/messages
// ─────────────────────────────────────────────
router.get('/:id/messages', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const convoDoc = await db.collection('conversations').doc(req.params['id']).get()
    if (!convoDoc.exists) { notFound(res); return }
    if (!convoDoc.data()!['participants'].includes(req.userId)) {
      debugWarn('conversations.messages.list', 'Blocked non-participant message list', {
        conversationId: req.params['id'],
        userId: req.userId,
      })
      res.status(403).json({ success: false, message: 'Not a participant' }); return
    }

    const snap = await db.collection('messages')
      .where('conversationId', '==', req.params['id'])
      .orderBy('timestamp', 'asc')
      .limit(100)
      .get()

    const messages = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    debugLog('conversations.messages.list', 'Fetched messages', {
      conversationId: req.params['id'],
      userId: req.userId,
      count: messages.length,
    })
    ok(res, messages)
  } catch (err) { next(err) }
})

// ─────────────────────────────────────────────
// POST /conversations/:id/messages
// ─────────────────────────────────────────────
router.post('/:id/messages', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const schema = z.object({ content: z.string().min(1).max(1000) })
    const { content } = schema.parse(req.body)
    debugLog('conversations.messages.send', 'Send message request', {
      conversationId: req.params['id'],
      senderId: req.userId,
      contentLength: content.length,
    })

    const convoDoc = await db.collection('conversations').doc(req.params['id']).get()
    if (!convoDoc.exists) { notFound(res); return }

    const convo = convoDoc.data()!
    if (!convo['participants'].includes(req.userId)) {
      debugWarn('conversations.messages.send', 'Blocked non-participant send', {
        conversationId: req.params['id'],
        userId: req.userId,
      })
      res.status(403).json({ success: false, message: 'Not a participant' }); return
    }

    const now     = new Date().toISOString()
    const msgRef  = db.collection('messages').doc()
    const message = {
      conversationId: req.params['id'],
      senderId:       req.userId,
      type:           'text',
      content,
      timestamp:      now,
      read:           false,
    }

    // Write message + update conversation atomically
    const batch = db.batch()
    batch.set(msgRef, message)
    batch.update(convoDoc.ref, {
      lastMessage:  message,
      updatedAt:    now,
      unreadCount:  1,          // simplified — full implementation would per-user track this
    })
    await batch.commit()

    // Push notification to the other participant
    const recipientId = convo['participants'].find((p: string) => p !== req.userId)
    if (recipientId) {
      const sender = await User.findOne({ firebaseUid: req.firebaseUid }).select('displayName').lean()
      notifyNewMessage(
        recipientId,
        sender?.displayName ?? 'Someone',
        content,
        req.params['id']
      )
    }
    debugLog('conversations.messages.send', 'Message sent', {
      conversationId: req.params['id'],
      messageId: msgRef.id,
      senderId: req.userId,
      recipientId: recipientId ?? null,
    })

    created(res, { id: msgRef.id, ...message })
  } catch (err) { next(err) }
})

// ─────────────────────────────────────────────
// POST /conversations/:id/read
// ─────────────────────────────────────────────
router.post('/:id/read', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    await db.collection('conversations').doc(req.params['id']).update({ unreadCount: 0 })
    debugLog('conversations.read', 'Marked conversation as read', {
      conversationId: req.params['id'],
      userId: req.userId,
    })
    ok(res, { ok: true })
  } catch (err) { next(err) }
})

export { router as conversationsRouter }
