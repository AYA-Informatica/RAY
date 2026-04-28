import { Request, Response, NextFunction } from 'express'

// ─── Typed API response helpers ───────────────
export function ok<T>(res: Response, data: T, message?: string): void {
  res.json({ success: true, data, ...(message ? { message } : {}) })
}

export function created<T>(res: Response, data: T): void {
  res.status(201).json({ success: true, data })
}

export function noContent(res: Response): void {
  res.status(204).send()
}

export function notFound(res: Response, message = 'Not found'): void {
  res.status(404).json({ success: false, message })
}

export function forbidden(res: Response, message = 'Forbidden'): void {
  res.status(403).json({ success: false, message })
}

export function badRequest(res: Response, message: string): void {
  res.status(400).json({ success: false, message })
}

// ─── Global error handler ─────────────────────
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[Error]', err.message, err.stack)

  if (err.name === 'ValidationError') {
    res.status(400).json({ success: false, message: err.message })
    return
  }
  if (err.name === 'CastError') {
    res.status(400).json({ success: false, message: 'Invalid ID format' })
    return
  }
  if ((err as NodeJS.ErrnoException).code === '11000') {
    res.status(409).json({ success: false, message: 'Duplicate entry' })
    return
  }

  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  })
}
