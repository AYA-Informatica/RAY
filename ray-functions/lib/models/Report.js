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
exports.Report = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ReportSchema = new mongoose_1.Schema({
    type: { type: String, enum: ['listing', 'user'], required: true, index: true },
    targetId: { type: String, required: true, index: true },
    reportedBy: { type: String, required: true },
    reason: { type: String, required: true },
    details: { type: String, maxlength: 500 },
    status: {
        type: String,
        enum: ['pending', 'resolved', 'dismissed'],
        default: 'pending',
        index: true,
    },
    resolution: { type: String },
    resolvedBy: { type: String },
    resolvedAt: { type: Date },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (_doc, ret) => { ret.id = ret._id; ret._id = undefined; ret.__v = undefined; return ret; },
    },
});
ReportSchema.index({ status: 1, createdAt: -1 });
// Prevent duplicate reports from same user on same target
ReportSchema.index({ targetId: 1, reportedBy: 1, type: 1 }, { unique: true });
exports.Report = mongoose_1.default.models.Report || mongoose_1.default.model('Report', ReportSchema);
//# sourceMappingURL=Report.js.map