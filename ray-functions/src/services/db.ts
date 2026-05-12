import mongoose from 'mongoose'

console.log('=== DATABASE CONNECTION DEBUG ===')
console.log('MONGODB_URI available:', !!process.env.MONGODB_URI)
console.log('MONGODB_URI length:', process.env.MONGODB_URI?.length || 0)

let isConnected = false

export const connectDB = async () => {
  if (isConnected) {
    console.log('✓ Already connected to MongoDB')
    return
  }

  try {
    console.log('⏳ Attempting to connect to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI!)
    isConnected = true
    console.log('✓ Successfully connected to MongoDB')
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error)
    throw error
  }
  console.log('=== END DATABASE CONNECTION DEBUG ===')
}
