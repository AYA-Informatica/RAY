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
exports.Boost = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const BoostSchema = new mongoose_1.Schema({
    listingId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    type: {
        type: String,
        enum: ['featured', 'top_ad', 'elite_seller'],
        required: true,
    },
    priceRwf: { type: Number, required: true, min: 0 },
    durationDays: { type: Number, required: true, min: 1 },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true },
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
BoostSchema.index({ userId: 1, createdAt: -1 });
BoostSchema.index({ listingId: 1, type: 1 });
exports.Boost = mongoose_1.default.models.Boost || mongoose_1.default.model('Boost', BoostSchema);
//# sourceMappingURL=Boost.js.map