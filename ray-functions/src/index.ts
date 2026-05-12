import * as functions from 'firebase-functions'
import express from 'express'
import cors from 'cors'

// ─────────────────────────────────────────────
// Environment variable loading for local development
// ─────────────────────────────────────────────
// Load .env file only in development when running locally
if (process.env.NODE_ENV === 'development' && !process.env.FIREBASE_PROJECT_ID) {
  try {
    require('dotenv').config()
    console.log('✓ Loaded environment variables from .env')
  } catch (error: any) {
    console.warn('⚠️ Could not load .env file:', error?.message || error)
  }
}

// Verify critical environment variables are present
const requiredVars = ['FIREBASE_PROJECT_ID', 'MONGODB_URI']
const missingVars = requiredVars.filter(varName => !process.env[varName])

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars)
  console.error('Functions may not work correctly without these variables')
}

// ─────────────────────────────────────────────
// Express app
// ─────────────────────────────────────────────
const app = express()

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://ray.vercel.app',
    'https://ray-production.web.app',
    'https://ray-production.firebaseapp.com',
  ],
  credentials: true,
}))

app.use(express.json({ limit: '10mb' }))

// ─── Health check ─────────────────────────────
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    envLoaded: !!process.env.MONGODB_URI,
    projectId: process.env.FIREBASE_PROJECT_ID 
  })
})

// ─── API routes ───────────────────────────────
import { listingsRouter }      from './routes/listings'
import { usersRouter }         from './routes/users'
import { conversationsRouter } from './routes/conversations'
import { reportsRouter }       from './routes/reports'
import { adminRouter }         from './routes/admin'
import { searchRouter }        from './routes/search'
import { migrationsRouter }    from './routes/migrations'
import { errorHandler }        from './utils/response'
import { searchLimiter } from './middleware/rateLimit'

app.use('/listings', listingsRouter)
app.use('/users', usersRouter)
app.use('/conversations', conversationsRouter)
app.use('/reports', reportsRouter)
app.use('/search', searchLimiter, searchRouter)
app.use('/admin', adminRouter)
app.use('/migrations', migrationsRouter)

// ─── Global error handler ─────────────────────
app.use(errorHandler)

// ─────────────────────────────────────────────
// Export HTTP function
// ─────────────────────────────────────────────
export const api = functions
  .runWith({ timeoutSeconds: 60, memory: '512MB' })
  .https.onRequest(app)

// ─────────────────────────────────────────────
// Scheduled functions
// ─────────────────────────────────────────────
export {
  expireListings,
  notifyExpiringListings,
  expireFeaturedBoosts,
  updateUserOnlineStatus,
  computeTrustLevels,
} from './scheduled'

// ─────────────────────────────────────────────
// Firestore + Auth triggers
// ─────────────────────────────────────────────
export {
  onMessageCreated,
  onUserCreated,
  onUserDeleted,
} from './triggers'
