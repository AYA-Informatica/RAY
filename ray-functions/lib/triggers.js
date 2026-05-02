"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.onUserDeleted = exports.onUserCreated = exports.onMessageCreated = void 0;
const functions = __importStar(require("firebase-functions"));
const db_1 = require("./services/db");
const User_1 = require("./models/User");
const Listing_1 = require("./models/Listing");
const firebase_1 = require("./services/firebase");
/**
 * onMessageCreated — fires when a new message is written to Firestore.
 * Updates the parent conversation's lastMessage + updatedAt,
 * and tracks response rate for the seller.
 */
exports.onMessageCreated = functions.firestore
    .document('messages/{messageId}')
    .onCreate(async (snap) => {
    const msg = snap.data();
    const { conversationId, senderId } = msg;
    const convoRef = firebase_1.db.collection('conversations').doc(conversationId);
    const convo = await convoRef.get();
    if (!convo.exists)
        return;
    const convoData = convo.data();
    const now = new Date().toISOString();
    // Update conversation metadata
    await convoRef.update({
        lastMessage: { ...msg, id: snap.id },
        updatedAt: now,
    });
    // If seller is responding, track response rate
    if (senderId === convoData['sellerId']) {
        await (0, db_1.connectDB)();
        const user = await User_1.User.findOne({ firebaseUid: senderId }).lean();
        if (user) {
            // Rolling average: weight new response into existing rate
            const current = user.responseRate ?? 0;
            const updated = Math.min(100, Math.round(current * 0.9 + 10));
            await User_1.User.findByIdAndUpdate(user._id, { responseRate: updated });
        }
    }
});
/**
 * onUserCreated — fires when a new Firebase Auth user is created.
 * Seeds a minimal MongoDB user record automatically.
 */
exports.onUserCreated = functions.auth.user().onCreate(async (fbUser) => {
    await (0, db_1.connectDB)();
    // Check if already exists (e.g. from /users/me endpoint race)
    const exists = await User_1.User.findOne({ firebaseUid: fbUser.uid });
    if (exists)
        return;
    await User_1.User.create({
        firebaseUid: fbUser.uid,
        phone: fbUser.phoneNumber ?? '',
        displayName: fbUser.displayName ?? 'RAY User',
        verificationStatus: 'phone',
        memberSince: new Date(),
    });
    console.log(`[onUserCreated] Seeded user for ${fbUser.uid}`);
});
/**
 * onUserDeleted — fires when a Firebase Auth user is deleted.
 * Cleans up their MongoDB record and deactivates listings.
 */
exports.onUserDeleted = functions.auth.user().onDelete(async (fbUser) => {
    await (0, db_1.connectDB)();
    const user = await User_1.User.findOne({ firebaseUid: fbUser.uid });
    if (!user)
        return;
    await Promise.all([
        User_1.User.deleteOne({ firebaseUid: fbUser.uid }),
        Listing_1.Listing.updateMany({ 'seller.id': String(user._id) }, { status: 'expired' }),
    ]);
    console.log(`[onUserDeleted] Cleaned up user ${fbUser.uid}`);
});
//# sourceMappingURL=triggers.js.map