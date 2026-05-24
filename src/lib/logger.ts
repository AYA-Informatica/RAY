import pino from "pino";

/**
 * Structured logger. Log auth failures, upload failures, API failures,
 * moderation actions and server exceptions — never raw errors to users.
 */
export const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  base: { app: "ray" },
});
