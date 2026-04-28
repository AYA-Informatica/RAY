import mongoose, { Schema, Document, Model } from 'mongoose'

// ─────────────────────────────────────────────
// Report
// ─────────────────────────────────────────────
export interface IReport extends Document {
  _id: string
  type: 'listing' | 'user'
  targetId: string
  reportedBy: string
  reason: string
  details?: string
  status: 'pending' | 'resolved' | 'dismissed'
  resolution?: string
  resolvedBy?: string
  resolvedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const ReportSchema = new Schema<IReport>(
  {
    type:     { type: String, enum: ['listing', 'user'], required: true, index: true },
    targetId: { type: String, required: true, index: true },
    reportedBy: { type: String, required: true },
    reason:   { type: String, required: true },
    details:  { type: String, maxlength: 500 },
    status:   {
      type: String,
      enum: ['pending', 'resolved', 'dismissed'],
      default: 'pending',
      index: true,
    },
    resolution:  { type: String },
    resolvedBy:  { type: String },
    resolvedAt:  { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => { ret.id = ret._id; delete ret._id; delete ret.__v; return ret },
    },
  }
)

ReportSchema.index({ status: 1, createdAt: -1 })
// Prevent duplicate reports from same user on same target
ReportSchema.index({ targetId: 1, reportedBy: 1, type: 1 }, { unique: true })

export const Report: Model<IReport> =
  mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema)

// ─────────────────────────────────────────────
// Boost / Monetisation Transaction
// ─────────────────────────────────────────────
export interface IBoost extends Document {
  _id: string
  listingId: string
  sellerId: string
  type: 'featured' | 'top_ad' | 'elite_seller'
  priceRwf: number
  durationDays: number
  startsAt: Date
  expiresAt: Date
  paymentMethod: 'momo' | 'card' | 'manual'
  paymentRef?: string
  status: 'active' | 'expired' | 'cancelled'
  createdAt: Date
}

const BoostSchema = new Schema<IBoost>(
  {
    listingId: { type: String, required: true, index: true },
    sellerId:  { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['featured', 'top_ad', 'elite_seller'],
      required: true,
    },
    priceRwf:     { type: Number, required: true },
    durationDays: { type: Number, required: true },
    startsAt:     { type: Date, required: true },
    expiresAt:    { type: Date, required: true, index: true },
    paymentMethod: { type: String, enum: ['momo', 'card', 'manual'], required: true },
    paymentRef:   { type: String },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => { ret.id = ret._id; delete ret._id; delete ret.__v; return ret },
    },
  }
)

BoostSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const Boost: Model<IBoost> =
  mongoose.models.Boost || mongoose.model<IBoost>('Boost', BoostSchema)
