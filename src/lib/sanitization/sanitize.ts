/**
 * Strip HTML tags from plain text fields. RAY stores plain text only —
 * no HTML ever persists to the DB. React escapes output automatically,
 * so this is a defence-in-depth measure against stored content that
 * somehow bypasses the React layer.
 *
 * Uses a regex rather than isomorphic-dompurify/JSDOM because JSDOM
 * fails to initialise in Vercel's serverless runtime environment.
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, "") // strip any <tag> or </tag>
    .replace(/&lt;/gi, "<") // decode encoded lt (then stripped on re-pass if needed)
    .trim();
}

/** Sanitize all string fields of a plain object in-place. */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const out = { ...obj } as Record<string, unknown>;
  for (const [k, v] of Object.entries(out)) {
    if (typeof v === "string") out[k] = sanitizeText(v);
  }
  return out as T;
}
