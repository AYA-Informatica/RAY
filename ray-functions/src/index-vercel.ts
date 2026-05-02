import express from 'express'
import cors from 'cors'
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

// ─── API routes (lazy loaded to avoid env var issues) ──────────────────────────────
app.use('/api/listings', async (req, res, next) => {
  const { listingsRouter } = await import('./routes/listings')
  listingsRouter(req, res, next)
})

app.use('/api/users/me', authLimiter, async (req, res, next) => {
  const { usersRouter } = await import('./routes/users')
  usersRouter(req, res, next)
})

app.use('/api/users', async (req, res, next) => {
  const { usersRouter } = await import('./routes/users')
  usersRouter(req, res, next)
})

app.use('/api/conversations', async (req, res, next) => {
  const { conversationsRouter } = await import('./routes/conversations')
  conversationsRouter(req, res, next)
})

app.use('/api/reports', async (req, res, next) => {
  const { reportsRouter } = await import('./routes/reports')
  reportsRouter(req, res, next)
})

app.use('/api/search', searchLimiter, async (req, res, next) => {
  const { searchRouter } = await import('./routes/search')
  searchRouter(req, res, next)
})

app.use('/admin', async (req, res, next) => {
  const { adminRouter } = await import('./routes/admin')
  adminRouter(req, res, next)
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
