import DOMPurify from "isomorphic-dompurify";

/**
 * Strip ALL HTML — RAY stores plain text only (titles, descriptions, bios,
 * messages). Prevents stored XSS. Always run server-side before persisting.
 */
export function sanitizeText(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
}

/** Recursively sanitize string fields of a plain object. */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const out = { ...obj } as Record<string, unknown>;
  for (const [k, v] of Object.entries(out)) {
    if (typeof v === "string") out[k] = sanitizeText(v);
  }
  return out as T;
}
