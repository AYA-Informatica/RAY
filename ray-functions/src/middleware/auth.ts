import { Request, Response, NextFunction } from 'express'
import { auth } from '../services/firebase'
import { debugError, debugLog, debugWarn } from '../utils/debug'

export interface AuthRequest extends Request {
  userId?: string
  userRole?: string
  firebaseUid?: string
}

/**
 * requireAuth — verifies the Firebase Bearer token on every protected request.
 * Attaches userId, userRole, and firebaseUid to req.
 */
export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    debugWarn('auth.requireAuth', 'Missing bearer token', {
      method: req.method,
      path: req.path,
      hasAuthorizationHeader: !!header,
    })
    res.status(401).json({ success: false, message: 'Missing or invalid auth token' })
    return
  }

  try {
    const token   = header.split('Bearer ')[1]
    const decoded = await auth.verifyIdToken(token)

    req.firebaseUid = decoded.uid
    req.userId      = decoded.uid        // resolved to MongoDB _id in route handlers
    req.userRole    = decoded.role as string | undefined ?? 'user'
    debugLog('auth.requireAuth', 'Authenticated request', {
      method: req.method,
      path: req.path,
      userId: req.userId,
      role: req.userRole,
    })

    next()
  } catch (err) {
    debugError('auth.requireAuth', 'Token verification failed', {
      method: req.method,
      path: req.path,
      error: err instanceof Error ? err.message : String(err),
    })
    res.status(401).json({ success: false, message: 'Invalid or expired token' })
  }
}

/**
 * requireAdmin — extends requireAuth, restricts to admin roles.
 */
export function requireAdmin(roles: string[] = ['admin', 'moderator', 'support']) {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    await requireAuth(req, res, async () => {
      if (!req.userRole || !roles.includes(req.userRole)) {
        debugWarn('auth.requireAdmin', 'Blocked insufficient role', {
          method: req.method,
          path: req.path,
          userId: req.userId,
          role: req.userRole,
          allowedRoles: roles,
        })
        res.status(403).json({ success: false, message: 'Insufficient permissions' })
        return
      }
      debugLog('auth.requireAdmin', 'Authorized admin route', {
        method: req.method,
        path: req.path,
        userId: req.userId,
        role: req.userRole,
      })
      next()
    })
  }
}

/**
 * optionalAuth — attaches user context if token is present, but doesn't block.
 */
export async function optionalAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const header = req.headers.authorization
  if (header?.startsWith('Bearer ')) {
    try {
      const decoded   = await auth.verifyIdToken(header.split('Bearer ')[1])
      req.firebaseUid = decoded.uid
      req.userId      = decoded.uid
      req.userRole    = decoded.role as string ?? 'user'
      debugLog('auth.optionalAuth', 'Optional auth attached', {
        method: req.method,
        path: req.path,
        userId: req.userId,
      })
    } catch (err) {
      debugWarn('auth.optionalAuth', 'Optional auth token invalid', {
        method: req.method,
        path: req.path,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }
  next()
}
