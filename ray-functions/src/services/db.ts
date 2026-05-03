import mongoose from 'mongoose'

// This must be at the TOP of the file, outside any function:
const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  throw new Error('[db] MONGODB_URI environment variable is not set. Check your .env file.')
}

let cached: typeof mongoose | null = null

/**
 * connectDB — cached Mongoose connection for Cloud Functions.
 * Functions are stateless but connections are reused across warm invocations.
 */
export async function connectDB(): Promise<typeof mongoose> {
  if (cached && mongoose.connection.readyState === 1) {
    console.log('[functions.db] Using cached MongoDB connection')
    return cached
  }

  console.log('[functions.db] Connecting to MongoDB...')
  cached = await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 10,
    minPoolSize: 2,
    socketTimeoutMS: 45000,
  })

  mongoose.connection.on('error', (err) => {
    console.error('[functions.db] MongoDB connection error:', err)
    cached = null
  })

  mongoose.connection.on('disconnected', () => {
    console.warn('[functions.db] MongoDB disconnected — will reconnect on next request')
    cached = null
  })

  console.log('[functions.db] MongoDB connected successfully')
  return cached
}
