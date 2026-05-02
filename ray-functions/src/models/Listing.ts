import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface IListing extends Document {
  _id: Types.ObjectId
  title: string
  description?: string
  price: number
  negotiable: boolean
  condition: 'new' | 'like_new' | 'good' | 'fair'
  category: string
  subcategory?: string
  images: string[]
  coverImage: string
  location: {
    district: string
    neighborhood: string
    displayLabel: string
    lat?: number
    lng?: number
  }
  seller: {
    id: string
    displayName: string
    avatar?: string
    trustLevel: number
    verificationStatus: string
    responseRate?: number
  }
  status: 'active' | 'sold' | 'expired' | 'pending_review' | 'rejected'
  rejectionReason?: string
  isFeatured: boolean
  featuredUntil?: Date
  isPromoted: boolean
  promotedUntil?: Date
  views: number
  chatCount: number
  savedCount: number
  tags: string[]
  postedAt: Date
  expiresAt: Date
  soldAt?: Date
  createdAt: Date
  updatedAt: Date
}

const ListingSchema = new Schema<IListing>(
  {
    title:       { type: String, required: true, trim: true, maxlength: 100, index: 'text' },
    description: { type: String, trim: true, maxlength: 500 },
    price:       { type: Number, required: true, min: 0, index: true },
    negotiable:  { type: Boolean, default: false },

    condition: {
      type: String,
      enum: ['new', 'like_new', 'good', 'fair'],
      required: true,
    },
    category:    { type: String, required: true, index: true },
    subcategory: { type: String },

    images:      { type: [String], required: true },
    coverImage:  { type: String, required: true },

    location: {
      district:     { type: String, required: true, index: true },
      neighborhood: { type: String, required: true, index: true },
      displayLabel: { type: String, required: true },
      lat:          { type: Number },
      lng:          { type: Number },
    },

    seller: {
      id:                 { type: String, required: true, index: true },
      displayName:        { type: String, required: true },
      avatar:             { type: String },
      trustLevel:         { type: Number },
      verificationStatus: { type: String },
      responseRate:       { type: Number },
    },

    status: {
      type: String,
      enum: ['active', 'sold', 'expired', 'pending_review', 'rejected'],
      default: 'active',
      index: true,
    },
    rejectionReason: { type: String },

    isFeatured:    { type: Boolean, default: false, index: true },
    featuredUntil: { type: Date },
    isPromoted:    { type: Boolean, default: false },
    promotedUntil: { type: Date },

    views:      { type: Number, default: 0 },
    chatCount:  { type: Number, default: 0 },
    savedCount: { type: Number, default: 0 },
    tags:       { type: [String], default: [] },

    postedAt:  { type: Date, default: Date.now, index: true },
    expiresAt: { type: Date, required: true, index: true },
    soldAt:    { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id
        ret._id = undefined
        ret.__v = undefined
        return ret
      },
    },
  }
)

// ─── Compound indexes for common queries ─────
ListingSchema.index({ status: 1, postedAt: -1 })
ListingSchema.index({ status: 1, category: 1, postedAt: -1 })
ListingSchema.index({ status: 1, 'location.district': 1, postedAt: -1 })
ListingSchema.index({ status: 1, price: 1 })
ListingSchema.index({ 'seller.id': 1, status: 1 })
ListingSchema.index({ isFeatured: 1, status: 1, postedAt: -1 })
ListingSchema.index({ title: 'text', description: 'text', tags: 'text' })

// ─── Auto-expire listings ────────────────────
ListingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const Listing: Model<IListing> =
  mongoose.models.Listing || mongoose.model<IListing>('Listing', ListingSchema)
