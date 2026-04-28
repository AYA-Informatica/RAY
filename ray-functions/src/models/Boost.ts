import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IBoost extends Document {
  _id: string
  listingId: string
  userId: string
  type: 'featured' | 'top_ad' | 'elite_seller'
  priceRwf: number
  durationDays: number
  startDate: Date
  endDate: Date
  createdAt: Date
  updatedAt: Date
}

const BoostSchema = new Schema<IBoost>(
  {
    listingId: { type: String, required: true, index: true },
    userId:    { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['featured', 'top_ad', 'elite_seller'],
      required: true,
    },
    priceRwf:      { type: Number, required: true, min: 0 },
    durationDays:  { type: Number, required: true, min: 1 },
    startDate:     { type: Date, required: true, index: true },
    endDate:       { type: Date, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        return ret
      },
    },
  }
)

BoostSchema.index({ userId: 1, createdAt: -1 })
BoostSchema.index({ listingId: 1, type: 1 })

export const Boost: Model<IBoost> =
  mongoose.models.Boost || mongoose.model<IBoost>('Boost', BoostSchema)
