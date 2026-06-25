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
  // 1st pass: strip raw tags
  // 2nd: decode common HTML entities so the 3rd pass can catch tags that
  //      arrived encoded (e.g. &lt;script&gt; → <script> → stripped)
  // 3rd pass: strip any tags that survived encoding
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&amp;/gi, "&")
    .replace(/<[^>]*>/g, "")
    .trim();
}

/** Sanitize all string fields of a plain object, recursing into nested objects. */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const out = { ...obj } as Record<string, unknown>;
  for (const [k, v] of Object.entries(out)) {
    if (typeof v === "string") {
      out[k] = sanitizeText(v);
    } else if (v && typeof v === "object" && !Array.isArray(v)) {
      out[k] = sanitizeObject(v as Record<string, unknown>);
    }
  }
  return out as T;
}
