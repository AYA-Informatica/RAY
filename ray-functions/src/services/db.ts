import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) throw new Error('MONGODB_URI environment variable is not set')

let cached: typeof mongoose | null = null

/**
 * connectDB — cached Mongoose connection for Cloud Functions.
 * Functions are stateless but connections are reused across warm invocations.
 */
export async function connectDB(): Promise<typeof mongoose> {
  if (cached && mongoose.connection.readyState === 1) {
    return cached
  }

  cached = await mongoose.connect(MONGODB_URI!, {
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 10,
    minPoolSize: 2,
    socketTimeoutMS: 45000,
  })

  mongoose.connection.on('error', (err) => {
    console.error('[MongoDB] Connection error:', err)
    cached = null
  })

  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] Disconnected — will reconnect on next request')
    cached = null
  })

  console.log('[MongoDB] Connected')
  return cached
}
