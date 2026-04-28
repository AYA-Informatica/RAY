import * as functions from 'firebase-functions'
import express from 'express'
import cors from 'cors'
import { listingsRouter }      from './routes/listings'
import { usersRouter }         from './routes/users'
import { conversationsRouter } from './routes/conversations'
import { reportsRouter }       from './routes/reports'
import { adminRouter }         from './routes/admin'
import { searchRouter }        from './routes/search'
import { errorHandler }        from './utils/response'
import { authLimiter, searchLimiter } from './middleware/rateLimit'

// ─────────────────────────────────────────────
// Express app
// ─────────────────────────────────────────────
const app = express()

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://ray.rw',
    'https://admin.ray.rw',
    /\.ray\.rw$/,
  ],
  credentials: true,
}))

app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() })
})

// ─── API routes ──────────────────────────────
app.use('/api/listings',      listingsRouter)
app.use('/api/users/me',      authLimiter, usersRouter)
app.use('/api/users',         usersRouter)
app.use('/api/conversations', conversationsRouter)
app.use('/api/reports',       reportsRouter)
app.use('/api/search',        searchLimiter, searchRouter)
app.use('/admin',             adminRouter)

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
