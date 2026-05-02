"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conversationsRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const firebase_1 = require("../services/firebase");
const Listing_1 = require("../models/Listing");
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const response_1 = require("../utils/response");
const notificationService_1 = require("../services/notificationService");
const db_1 = require("../services/db");
const debug_1 = require("../utils/debug");
const router = (0, express_1.Router)();
exports.conversationsRouter = router;
// ─────────────────────────────────────────────
// GET /conversations  — list all for current user
// ─────────────────────────────────────────────
router.get('/', auth_1.requireAuth, async (req, res, next) => {
    try {
        const snap = await firebase_1.db.collection('conversations')
            .where('participants', 'array-contains', req.userId)
            .orderBy('updatedAt', 'desc')
            .limit(50)
            .get();
        const convos = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        (0, debug_1.debugLog)('conversations.list', 'Fetched conversations', {
            userId: req.userId,
            count: convos.length,
        });
        (0, response_1.ok)(res, convos);
    }
    catch (err) {
        next(err);
    }
});
// ─────────────────────────────────────────────
// GET /conversations/:id
// ─────────────────────────────────────────────
router.get('/:id', auth_1.requireAuth, async (req, res, next) => {
    try {
        const doc = await firebase_1.db.collection('conversations').doc(req.params['id']).get();
        if (!doc.exists) {
            (0, response_1.notFound)(res, 'Conversation not found');
            return;
        }
        const data = doc.data();
        if (!data['participants'].includes(req.userId)) {
            (0, debug_1.debugWarn)('conversations.getById', 'Blocked non-participant access', {
                conversationId: req.params['id'],
                userId: req.userId,
            });
            res.status(403).json({ success: false, message: 'Not a participant' });
            return;
        }
        (0, debug_1.debugLog)('conversations.getById', 'Fetched conversation', {
            conversationId: req.params['id'],
            userId: req.userId,
        });
        (0, response_1.ok)(res, { id: doc.id, ...data });
    }
    catch (err) {
        next(err);
    }
});
// ─────────────────────────────────────────────
// POST /conversations  — start or retrieve conversation for a listing
// ─────────────────────────────────────────────
router.post('/', auth_1.requireAuth, async (req, res, next) => {
    try {
        await (0, db_1.connectDB)();
        const schema = zod_1.z.object({ listingId: zod_1.z.string().min(1) });
        const { listingId } = schema.parse(req.body);
        (0, debug_1.debugLog)('conversations.start', 'Start conversation request', {
            userId: req.userId,
            listingId,
        });
        const listing = await Listing_1.Listing.findById(listingId).lean();
        if (!listing) {
            (0, response_1.notFound)(res, 'Listing not found');
            return;
        }
        if (String(listing.seller.id) === req.userId) {
            (0, response_1.badRequest)(res, 'Cannot start a conversation on your own listing');
            return;
        }
        const buyerId = req.userId;
        const sellerId = listing.seller.id;
        // Check if conversation already exists
        const existing = await firebase_1.db.collection('conversations')
            .where('listingId', '==', listingId)
            .where('participants', 'array-contains', buyerId)
            .limit(1)
            .get();
        if (!existing.empty) {
            const doc = existing.docs[0];
            (0, debug_1.debugLog)('conversations.start', 'Returning existing conversation', {
                conversationId: doc.id,
                listingId,
                userId: req.userId,
            });
            (0, response_1.ok)(res, { id: doc.id, ...doc.data() });
            return;
        }
        // Get buyer profile
        const buyer = await User_1.User.findOne({ firebaseUid: req.firebaseUid })
            .select('displayName avatar')
            .lean();
        // Create new conversation in Firestore
        const convoRef = firebase_1.db.collection('conversations').doc();
        const now = new Date().toISOString();
        const convoData = {
            listingId,
            listingSnapshot: {
                title: listing.title,
                price: listing.price,
                coverImage: listing.coverImage,
            },
            participants: [buyerId, sellerId],
            buyerId,
            sellerId,
            otherUser: {
                id: sellerId,
                displayName: listing.seller.displayName,
                avatar: listing.seller.avatar ?? null,
                trustLevel: listing.seller.trustLevel,
                verificationStatus: listing.seller.verificationStatus,
            },
            buyerInfo: {
                id: buyerId,
                displayName: buyer?.displayName ?? 'Buyer',
                avatar: buyer?.avatar ?? null,
            },
            lastMessage: null,
            unreadCount: 0,
            updatedAt: now,
            createdAt: now,
        };
        await convoRef.set(convoData);
        // Update listing chat count
        await Listing_1.Listing.findByIdAndUpdate(listingId, { $inc: { chatCount: 1 } });
        (0, debug_1.debugLog)('conversations.start', 'Created conversation', {
            conversationId: convoRef.id,
            listingId,
            buyerId,
            sellerId,
        });
        (0, response_1.created)(res, { id: convoRef.id, ...convoData });
    }
    catch (err) {
        next(err);
    }
});
// ─────────────────────────────────────────────
// GET /conversations/:id/messages
// ─────────────────────────────────────────────
router.get('/:id/messages', auth_1.requireAuth, async (req, res, next) => {
    try {
        const convoDoc = await firebase_1.db.collection('conversations').doc(req.params['id']).get();
        if (!convoDoc.exists) {
            (0, response_1.notFound)(res);
            return;
        }
        if (!convoDoc.data()['participants'].includes(req.userId)) {
            (0, debug_1.debugWarn)('conversations.messages.list', 'Blocked non-participant message list', {
                conversationId: req.params['id'],
                userId: req.userId,
            });
            res.status(403).json({ success: false, message: 'Not a participant' });
            return;
        }
        const snap = await firebase_1.db.collection('messages')
            .where('conversationId', '==', req.params['id'])
            .orderBy('timestamp', 'asc')
            .limit(100)
            .get();
        const messages = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        (0, debug_1.debugLog)('conversations.messages.list', 'Fetched messages', {
            conversationId: req.params['id'],
            userId: req.userId,
            count: messages.length,
        });
        (0, response_1.ok)(res, messages);
    }
    catch (err) {
        next(err);
    }
});
// ─────────────────────────────────────────────
// POST /conversations/:id/messages
// ─────────────────────────────────────────────
router.post('/:id/messages', auth_1.requireAuth, async (req, res, next) => {
    try {
        const schema = zod_1.z.object({ content: zod_1.z.string().min(1).max(1000) });
        const { content } = schema.parse(req.body);
        (0, debug_1.debugLog)('conversations.messages.send', 'Send message request', {
            conversationId: req.params['id'],
            senderId: req.userId,
            contentLength: content.length,
        });
        const convoDoc = await firebase_1.db.collection('conversations').doc(req.params['id']).get();
        if (!convoDoc.exists) {
            (0, response_1.notFound)(res);
            return;
        }
        const convo = convoDoc.data();
        if (!convo['participants'].includes(req.userId)) {
            (0, debug_1.debugWarn)('conversations.messages.send', 'Blocked non-participant send', {
                conversationId: req.params['id'],
                userId: req.userId,
            });
            res.status(403).json({ success: false, message: 'Not a participant' });
            return;
        }
        const now = new Date().toISOString();
        const msgRef = firebase_1.db.collection('messages').doc();
        const message = {
            conversationId: req.params['id'],
            senderId: req.userId,
            type: 'text',
            content,
            timestamp: now,
            read: false,
        };
        // Write message + update conversation atomically
        const batch = firebase_1.db.batch();
        batch.set(msgRef, message);
        batch.update(convoDoc.ref, {
            lastMessage: message,
            updatedAt: now,
            unreadCount: 1, // simplified — full implementation would per-user track this
        });
        await batch.commit();
        // Push notification to the other participant
        const recipientId = convo['participants'].find((p) => p !== req.userId);
        if (recipientId) {
            const sender = await User_1.User.findOne({ firebaseUid: req.firebaseUid }).select('displayName').lean();
            (0, notificationService_1.notifyNewMessage)(recipientId, sender?.displayName ?? 'Someone', content, req.params['id']);
        }
        (0, debug_1.debugLog)('conversations.messages.send', 'Message sent', {
            conversationId: req.params['id'],
            messageId: msgRef.id,
            senderId: req.userId,
            recipientId: recipientId ?? null,
        });
        (0, response_1.created)(res, { id: msgRef.id, ...message });
    }
    catch (err) {
        next(err);
    }
});
// ─────────────────────────────────────────────
// POST /conversations/:id/read
// ─────────────────────────────────────────────
router.post('/:id/read', auth_1.requireAuth, async (req, res, next) => {
    try {
        await firebase_1.db.collection('conversations').doc(req.params['id']).update({ unreadCount: 0 });
        (0, debug_1.debugLog)('conversations.read', 'Marked conversation as read', {
            conversationId: req.params['id'],
            userId: req.userId,
        });
        (0, response_1.ok)(res, { ok: true });
    }
    catch (err) {
        next(err);
    }
});
//# sourceMappingURL=conversations.js.map