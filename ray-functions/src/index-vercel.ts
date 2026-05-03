import express from 'express'
import cors from 'cors'
import { listingsRouter } from './routes/listings'
import { usersRouter } from './routes/users'
import { conversationsRouter } from './routes/conversations'
import { reportsRouter } from './routes/reports'
import { adminRouter } from './routes/admin'
import { searchRouter } from './routes/search'
import { errorHandler } from './utils/response'
import { searchLimiter } from './middleware/rateLimit'

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
    /\.vercel\.app$/,
  ],
  credentials: true,
}))

app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() })
})

app.get('/', (_req, res) => {
  res.json({ 
    name: 'RAY API',
    version: '1.0.0',
    status: 'running',
    env: {
      nodeEnv: process.env.NODE_ENV,
      hasMongoUri: !!process.env.MONGODB_URI,
      hasStorageBucket: !!process.env.FIREBASE_STORAGE_BUCKET,
    },
    endpoints: [
      '/api/listings',
      '/api/users',
      '/api/conversations',
      '/api/reports',
      '/api/search',
      '/admin'
    ]
  })
})

// ─── API routes (static imports) ─────────────
app.use('/api/listings', listingsRouter)
app.use('/api/users', usersRouter)
app.use('/api/conversations', conversationsRouter)
app.use('/api/reports', reportsRouter)
app.use('/api/search', searchLimiter, searchRouter)
app.use('/admin', adminRouter)

// ─── Global error handler ─────────────────────
app.use(errorHandler)

// ─────────────────────────────────────────────
// Export for Vercel
// ─────────────────────────────────────────────
export { app }

// For local development
if (require.main === module) {
  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => {
    console.log(`🚀 RAY API running on port ${PORT}`)
  })
}
