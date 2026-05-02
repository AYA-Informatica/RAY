import mongoose, { Schema, Document, Model, Types } from 'mongoose'

// ─────────────────────────────────────────────
// Interface
// ─────────────────────────────────────────────
export interface IUser extends Document {
  _id: Types.ObjectId
  firebaseUid: string
  phone: string
  displayName: string
  avatar?: string
  role: 'user' | 'dealer' | 'admin' | 'moderator' | 'support'
  verificationStatus: 'none' | 'phone' | 'id' | 'dealer'
  trustLevel: 1 | 2 | 3
  location?: {
    district: string
    neighborhood: string
    displayLabel: string
    lat?: number
    lng?: number
  }
  responseRate: number
  completedDeals: number
  activeListings: number
  totalViews: number
  isBanned: boolean
  banReason?: string
  bannedAt?: Date
  memberSince: Date
  lastSeen: Date
  isOnline: boolean
  fcmToken?: string
  settings: {
    language: 'en' | 'kin' | 'fr'
    notifications: {
      newMessage: boolean
      listingActivity: boolean
      priceDrops: boolean
    }
  }
  createdAt: Date
  updatedAt: Date
}

// ─────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────
const UserSchema = new Schema<IUser>(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    phone:       { type: String, required: true, unique: true, index: true },
    displayName: { type: String, required: true, trim: true, maxlength: 80 },
    avatar:      { type: String },

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
      district:     { type: String },
      neighborhood: { type: String },
      displayLabel: { type: String },
      lat:          { type: Number },
      lng:          { type: Number },
    },

    responseRate:    { type: Number, default: 0, min: 0, max: 100 },
    completedDeals:  { type: Number, default: 0, min: 0 },
    activeListings:  { type: Number, default: 0, min: 0 },
    totalViews:      { type: Number, default: 0, min: 0 },

    isBanned:   { type: Boolean, default: false, index: true },
    banReason:  { type: String },
    bannedAt:   { type: Date },

    memberSince: { type: Date, default: Date.now },
    lastSeen:    { type: Date, default: Date.now },
    isOnline:    { type: Boolean, default: false },
    fcmToken:    { type: String },

    settings: {
      language: { type: String, enum: ['en', 'kin', 'fr'], default: 'en' },
      notifications: {
        newMessage:      { type: Boolean, default: true },
        listingActivity: { type: Boolean, default: true },
        priceDrops:      { type: Boolean, default: true },
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id
        ret._id = undefined
        ret.__v = undefined
        ret.fcmToken = undefined
        ret.firebaseUid = undefined
        return ret
      },
    },
  }
)

// ─── Indexes ────────────────────────────────
UserSchema.index({ 'location.district': 1 })
UserSchema.index({ 'location.neighborhood': 1 })
UserSchema.index({ displayName: 'text' })
UserSchema.index({ isBanned: 1, createdAt: -1 })

// ─── Auto-compute trust level ────────────────
UserSchema.pre('save', function (next) {
  if (this.verificationStatus === 'id' || this.verificationStatus === 'dealer') {
    this.trustLevel = 3
  } else if (this.completedDeals >= 5 || this.responseRate >= 90) {
    this.trustLevel = 2
  } else {
    this.trustLevel = 1
  }
  next()
})

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
