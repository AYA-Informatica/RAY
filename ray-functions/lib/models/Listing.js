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
exports.Listing = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ListingSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true, maxlength: 100, index: 'text' },
    description: { type: String, trim: true, maxlength: 500 },
    price: { type: Number, required: true, min: 0, index: true },
    negotiable: { type: Boolean, default: false },
    condition: {
        type: String,
        enum: ['new', 'like_new', 'good', 'fair'],
        required: true,
    },
    category: { type: String, required: true, index: true },
    subcategory: { type: String },
    images: { type: [String], required: true },
    coverImage: { type: String, required: true },
    location: {
        district: { type: String, required: true, index: true },
        neighborhood: { type: String, required: true, index: true },
        displayLabel: { type: String, required: true },
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        source: { type: String, enum: ['gps', 'manual'], default: 'manual' },
    },
    seller: {
        id: { type: String, required: true, index: true },
        displayName: { type: String, required: true },
        avatar: { type: String },
        trustLevel: { type: Number },
        verificationStatus: { type: String },
        responseRate: { type: Number },
    },
    status: {
        type: String,
        enum: ['active', 'sold', 'expired', 'pending_review', 'rejected'],
        default: 'active',
        index: true,
    },
    rejectionReason: { type: String },
    isFeatured: { type: Boolean, default: false, index: true },
    featuredUntil: { type: Date },
    isPromoted: { type: Boolean, default: false },
    promotedUntil: { type: Date },
    views: { type: Number, default: 0 },
    chatCount: { type: Number, default: 0 },
    savedCount: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
    meta: {
        type: Map,
        of: mongoose_1.default.Schema.Types.Mixed,
        default: {},
    },
    postedAt: { type: Date, default: Date.now, index: true },
    expiresAt: { type: Date, required: true, index: true },
    soldAt: { type: Date },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (_doc, ret) => {
            ret.id = ret._id;
            ret._id = undefined;
            ret.__v = undefined;
            return ret;
        },
    },
});
// ─── Compound indexes for common queries ─────
ListingSchema.index({ status: 1, postedAt: -1 });
ListingSchema.index({ status: 1, category: 1, postedAt: -1 });
ListingSchema.index({ status: 1, 'location.district': 1, postedAt: -1 });
ListingSchema.index({ status: 1, price: 1 });
ListingSchema.index({ 'seller.id': 1, status: 1 });
ListingSchema.index({ isFeatured: 1, status: 1, postedAt: -1 });
ListingSchema.index({ title: 'text', description: 'text', tags: 'text' });
// Category + brand (mobiles, electronics, fashion, health, sports)
ListingSchema.index({ status: 1, category: 1, 'meta.brand': 1 });
// Category + make/year (vehicles)
ListingSchema.index({ status: 1, category: 1, 'meta.make': 1 });
ListingSchema.index({ status: 1, category: 1, 'meta.year': 1 });
// Category + bedrooms (property)
ListingSchema.index({ status: 1, category: 1, 'meta.bedrooms': 1 });
// Category + size (fashion, kids, sports)
ListingSchema.index({ status: 1, category: 1, 'meta.size': 1 });
// Category + age_range (kids)
ListingSchema.index({ status: 1, category: 1, 'meta.age_range': 1 });
// Geospatial index
ListingSchema.index({ geoPoint: '2dsphere' });
// ─── Auto-expire listings ────────────────────
ListingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// ─── Auto-populate geoPoint from location coordinates ────────────────────
ListingSchema.pre('save', function (next) {
    if (this.location?.lat && this.location?.lng) {
        this.geoPoint = {
            type: 'Point',
            coordinates: [this.location.lng, this.location.lat], // GeoJSON: lng first
        };
    }
    next();
});
exports.Listing = mongoose_1.default.models.Listing || mongoose_1.default.model('Listing', ListingSchema);
//# sourceMappingURL=Listing.js.map