import mongoose, { Schema, Document, Model, Types } from 'mongoose'

// ─────────────────────────────────────────────
// Report
// ─────────────────────────────────────────────
export interface IReport extends Document {
  _id: Types.ObjectId
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
      transform: (_doc, ret: any) => { ret.id = ret._id; ret._id = undefined; ret.__v = undefined; return ret },
    },
  }
)

ReportSchema.index({ status: 1, createdAt: -1 })
// Prevent duplicate reports from same user on same target
ReportSchema.index({ targetId: 1, reportedBy: 1, type: 1 }, { unique: true })

export const Report: Model<IReport> =
  mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema)
