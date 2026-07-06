import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthError } from "@/lib/auth/session";
import { logger } from "@/lib/logger";

/** Standard success envelope. */
export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

/** Standard error envelope — NEVER leaks stack traces / SQL to the client. */
export function fail(message: string, status = 400, code?: string) {
  return NextResponse.json({ error: { message, code } }, { status });
}

/** Maps thrown errors to safe HTTP responses. */
export function handleApiError(err: unknown) {
  if (err instanceof ZodError) {
    logger.debug({ issue: err.issues[0]?.message }, "[utils/api] handleApiError validation error");
    return fail(err.issues[0]?.message ?? "Invalid input", 422, "VALIDATION");
  }
  if (err instanceof AuthError) {
    const status = err.message === "Forbidden" ? 403 : 401;
    logger.debug({ status }, "[utils/api] handleApiError auth error");
    return fail(err.message, status, "AUTH");
  }
  logger.error({ err }, "Unhandled API error");
  return fail("Something went wrong. Please try again.", 500, "INTERNAL");
}

export const RATE_LIMITED = () => fail("Too many requests. Slow down.", 429, "RATE_LIMIT");
