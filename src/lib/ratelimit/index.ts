import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { logger } from "@/lib/logger";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = url && token ? new Redis({ url, token }) : null;

if (!redis) {
  logger.warn("Upstash Redis not configured — rate limiting is disabled (dev only).");
}

function make(limiter: ReturnType<typeof Ratelimit.slidingWindow>) {
  return redis ? new Ratelimit({ redis, limiter, analytics: false }) : null;
}

/** Per-route limiters. Tune windows per the engineering doc. */
export const limiters = {
  listingCreate: make(Ratelimit.slidingWindow(10, "10 m")),
  chatSend: make(Ratelimit.slidingWindow(30, "1 m")),
  report: make(Ratelimit.slidingWindow(5, "10 m")),
  upload: make(Ratelimit.slidingWindow(20, "10 m")),
  search: make(Ratelimit.slidingWindow(60, "1 m")),
} as const;

/**
 * Returns true if allowed. When Redis is absent (dev), always allows.
 * `identifier` should be the authed user id or client IP.
 */
export async function checkLimit(
  limiter: Ratelimit | null,
  identifier: string,
): Promise<boolean> {
  if (!limiter) return true;
  const { success } = await limiter.limit(identifier);
  if (!success) {
    logger.warn({ identifier }, "[ratelimit] checkLimit blocked");
  } else {
    logger.debug({ identifier }, "[ratelimit] checkLimit allowed");
  }
  return success;
}
