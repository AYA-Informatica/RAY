import express from 'express'
import cors from 'cors'
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

// ─── API routes (lazy loaded) ─────────────────
app.use('/api/listings', (req, res, next) => {
  import('./routes/listings').then(({ listingsRouter }) => {
    listingsRouter(req, res, next)
  }).catch(next)
})

app.use('/api/users', (req, res, next) => {
  import('./routes/users').then(({ usersRouter }) => {
    usersRouter(req, res, next)
  }).catch(next)
})

app.use('/api/conversations', (req, res, next) => {
  import('./routes/conversations').then(({ conversationsRouter }) => {
    conversationsRouter(req, res, next)
  }).catch(next)
})

app.use('/api/reports', (req, res, next) => {
  import('./routes/reports').then(({ reportsRouter }) => {
    reportsRouter(req, res, next)
  }).catch(next)
})

app.use('/api/search', searchLimiter, (req, res, next) => {
  import('./routes/search').then(({ searchRouter }) => {
    searchRouter(req, res, next)
  }).catch(next)
})

app.use('/admin', (req, res, next) => {
  import('./routes/admin').then(({ adminRouter }) => {
    adminRouter(req, res, next)
  }).catch(next)
})

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
