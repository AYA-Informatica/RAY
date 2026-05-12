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
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// ─────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────
const UserSchema = new mongoose_1.Schema({
    firebaseUid: { type: String, required: true, unique: true, index: true },
    phone: { type: String, required: true, unique: true, index: true },
    displayName: { type: String, required: true, trim: true, maxlength: 80 },
    avatar: { type: String },
    role: {
        type: String,
        enum: ['user', 'dealer', 'admin', 'moderator', 'support'],
        default: 'user',
    },
    verificationStatus: {
        type: String,
        enum: ['none', 'phone', 'id', 'dealer'],
        default: 'phone',
    },
    trustLevel: { type: Number, enum: [1, 2, 3], default: 1 },
    location: {
        district: { type: String },
        neighborhood: { type: String },
        displayLabel: { type: String },
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    responseRate: { type: Number, default: 0, min: 0, max: 100 },
    completedDeals: { type: Number, default: 0, min: 0 },
    activeListings: { type: Number, default: 0, min: 0 },
    totalViews: { type: Number, default: 0, min: 0 },
    isBanned: { type: Boolean, default: false, index: true },
    banReason: { type: String },
    bannedAt: { type: Date },
    memberSince: { type: Date, default: Date.now },
    lastSeen: { type: Date, default: Date.now },
    isOnline: { type: Boolean, default: false },
    fcmToken: { type: String },
    settings: {
        language: { type: String, enum: ['en', 'kin', 'fr'], default: 'en' },
        notifications: {
            newMessage: { type: Boolean, default: true },
            listingActivity: { type: Boolean, default: true },
            priceDrops: { type: Boolean, default: true },
        },
    },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (_doc, ret) => {
            ret.id = ret._id;
            ret._id = undefined;
            ret.__v = undefined;
            ret.fcmToken = undefined;
            ret.firebaseUid = undefined;
            return ret;
        },
    },
});
// ─── Indexes ────────────────────────────────
UserSchema.index({ 'location.district': 1 });
UserSchema.index({ 'location.neighborhood': 1 });
UserSchema.index({ displayName: 'text' });
UserSchema.index({ isBanned: 1, createdAt: -1 });
// ─── Auto-compute trust level ────────────────
UserSchema.pre('save', function (next) {
    if (this.verificationStatus === 'id' || this.verificationStatus === 'dealer') {
        this.trustLevel = 3;
    }
    else if (this.completedDeals >= 5 || this.responseRate >= 90) {
        this.trustLevel = 2;
    }
    else {
        this.trustLevel = 1;
    }
    next();
});
exports.User = mongoose_1.default.models.User || mongoose_1.default.model('User', UserSchema);
//# sourceMappingURL=User.js.map