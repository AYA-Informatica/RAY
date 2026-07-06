import { logger } from "@/lib/logger";

const noopStorage = {
  getItem: (_key: string): null => null,
  setItem: (_key: string, _value: string): void => undefined,
  removeItem: (_key: string): void => undefined,
  clear: (): void => undefined,
  length: 0,
  key: (_index: number): null => null,
};

/**
 * Returns localStorage if available, or a silent noop fallback.
 * Safari Private mode and some WebViews throw SecurityError on any localStorage
 * access — this probe keeps Zustand persist and other stores from crashing.
 */
export function safeLocalStorage(): Storage {
  if (typeof window === "undefined") return noopStorage as unknown as Storage;
  try {
    localStorage.setItem("__ray_probe__", "1");
    localStorage.removeItem("__ray_probe__");
    return localStorage;
  } catch {
    logger.debug("[safeStorage] safeLocalStorage blocked — falling back to noop");
    return noopStorage as unknown as Storage;
  }
}

/** Safe `localStorage.getItem` — returns null if storage is blocked. */
export function safeGetItem(key: string): string | null {
  try {
    return typeof window !== "undefined" ? localStorage.getItem(key) : null;
  } catch {
    return null;
  }
}

/** Safe `localStorage.setItem` — silently discards if storage is blocked. */
export function safeSetItem(key: string, value: string): void {
  try {
    if (typeof window !== "undefined") localStorage.setItem(key, value);
  } catch { /* storage blocked in Safari Private or restrictive WebView */ }
}

/** Safe `localStorage.removeItem` — silently discards if storage is blocked. */
export function safeRemoveItem(key: string): void {
  try {
    if (typeof window !== "undefined") localStorage.removeItem(key);
  } catch { /* storage blocked */ }
}
