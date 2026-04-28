import rateLimit from 'express-rate-limit'

const json429 = (_req: any, res: any) => {
  res.status(429).json({
    success: false,
    message: 'Too many requests. Please wait and try again.',
  })
}

/** OTP / auth: 5 requests per 15 minutes per IP */
export const authLimiter = rateLimit({
  windowMs:         15 * 60 * 1000,
  max:              5,
  standardHeaders:  true,
  legacyHeaders:    false,
  handler:          json429,
})

/** Listing creation: 10 per hour per authenticated user (key by userId header or IP) */
export const listingCreateLimiter = rateLimit({
  windowMs:         60 * 60 * 1000,
  max:              10,
  keyGenerator:     (req) => (req as any).userId ?? req.ip ?? 'unknown',
  standardHeaders:  true,
  legacyHeaders:    false,
  handler:          json429,
})

/** Search: 100 per minute per IP */
export const searchLimiter = rateLimit({
  windowMs:         60 * 1000,
  max:              100,
  standardHeaders:  true,
  legacyHeaders:    false,
  handler:          json429,
})

/** Reports: 5 per hour per user */
export const reportLimiter = rateLimit({
  windowMs:         60 * 60 * 1000,
  max:              5,
  keyGenerator:     (req) => (req as any).userId ?? req.ip ?? 'unknown',
  standardHeaders:  true,
  legacyHeaders:    false,
  handler:          json429,
})
