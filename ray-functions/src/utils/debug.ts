const isDebugEnabled = process.env.DEBUG_LOGS === 'true'

export function debugLog(scope: string, message: string, meta?: Record<string, unknown>): void {
  if (!isDebugEnabled) return
  if (meta) {
    console.log(`[${scope}] ${message}`, meta)
    return
  }
  console.log(`[${scope}] ${message}`)
}

export function debugWarn(scope: string, message: string, meta?: Record<string, unknown>): void {
  if (!isDebugEnabled) return
  if (meta) {
    console.warn(`[${scope}] ${message}`, meta)
    return
  }
  console.warn(`[${scope}] ${message}`)
}

export function debugError(scope: string, message: string, meta?: Record<string, unknown>): void {
  if (!isDebugEnabled) return
  if (meta) {
    console.error(`[${scope}] ${message}`, meta)
    return
  }
  console.error(`[${scope}] ${message}`)
}
