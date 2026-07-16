import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isAuthSessionMissingError } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";
import { logger } from "@/lib/logger";

/** Returns the Supabase auth user or null. Never throws.
 *  Memoized per-request so multiple server components on the same page
 *  share one Supabase round-trip.
 *
 *  Supports two auth transports:
 *   - Cookie session (web) — the default `supabase.auth.getUser()` call.
 *   - `Authorization: Bearer <access_token>` (mobile app — no cookie jar in
 *     a bare React Native fetch()) — verified via `getUser(token)`.
 *  Cookie path is tried first when no bearer header is present, so this is
 *  purely additive for existing web/cookie traffic. */
export const getAuthUser = cache(async () => {
  const supabase = await createClient();
  const bearer = (await headers()).get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  const {
    data: { user },
    error,
  } = bearer ? await supabase.auth.getUser(bearer) : await supabase.auth.getUser();
  // "Session missing" is the expected, routine shape of every anonymous
  // visit on a mostly-public marketplace -- not an error worth logging as
  // one. console.error-ing it here spammed Sentry and Next's dev overlay
  // on every single logged-out page view.
  if (error && !isAuthSessionMissingError(error)) {
    console.error("[session] getAuthUser error:", error.message);
  }
  logger.debug({ hasUser: Boolean(user), viaBearer: Boolean(bearer) }, "[session] getAuthUser resolved");
  return user;
});

/** Returns the full public.User row, or null if unauthenticated.
 *  Memoized per-request — multiple server components on the same page share
 *  one DB lookup. Uses findUnique for the common case (user exists) and only
 *  falls back to upsert when the row is missing (trigger race / first sign-in). */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const authUser = await getAuthUser();
  if (!authUser) return null;
  try {
    const existing = await prisma.user.findUnique({ where: { id: authUser.id } });
    if (existing) {
      logger.debug({ userId: authUser.id }, "[session] getCurrentUser found existing row");
      return existing;
    }
    // Row missing — create it from OAuth metadata (trigger race or missing trigger).
    logger.debug({ userId: authUser.id }, "[session] getCurrentUser row missing — creating from OAuth metadata");
    const meta = authUser.user_metadata ?? {};
    const user = await prisma.user.create({
      data: {
        id: authUser.id,
        email: authUser.email ?? `${authUser.id}@ray.invalid`,
        name: (meta.full_name ?? meta.name ?? null) as string | null,
        avatarUrl: (meta.avatar_url ?? meta.picture ?? null) as string | null,
      },
    });
    return user;
  } catch (err) {
    console.error("[session] getCurrentUser error:", err instanceof Error ? err.message : err);
    throw err;
  }
});

/** Throws "Unauthorized" if no session — use to guard protected API routes. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    logger.warn("[session] requireUser rejected — no session");
    throw new AuthError("Unauthorized");
  }
  if (user.isBanned) {
    logger.warn({ userId: user.id }, "[session] requireUser rejected — account suspended");
    throw new AuthError("Account suspended");
  }
  if (user.deletedAt) {
    logger.warn({ userId: user.id }, "[session] requireUser rejected — account deleted");
    throw new AuthError("Unauthorized");
  }
  return user;
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}
