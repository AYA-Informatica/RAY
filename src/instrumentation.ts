import * as Sentry from "@sentry/nextjs";
import { logger } from "@/lib/logger";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
    logger.info({ runtime: "nodejs" }, "[instrumentation] Sentry initialized");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
    logger.info({ runtime: "edge" }, "[instrumentation] Sentry initialized");
  }
}

// Captures errors from nested React Server Components
export const onRequestError = Sentry.captureRequestError;
