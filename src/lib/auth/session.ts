import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";

/** Returns the Supabase auth user or null. Never throws.
 *  Memoized per-request so multiple server components on the same page
 *  share one Supabase round-trip. */
export const getAuthUser = cache(async () => {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) console.error("[session] getAuthUser error:", error.message);
  console.log("[session] getAuthUser:", user ? `uid=${user.id}` : "null");
  return user;
});

/** Returns the full public.User row, or null if unauthenticated.
 *  Memoized per-request — multiple server components on the same page share
 *  one DB lookup. Uses findUnique for the common case (user exists) and only
 *  falls back to upsert when the row is missing (trigger race / first sign-in). */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const authUser = await getAuthUser();
  if (!authUser) return null;
  console.log("[session] getCurrentUser: looking up prisma User for", authUser.id);
  try {
    const existing = await prisma.user.findUnique({ where: { id: authUser.id } });
    if (existing) {
      console.log("[session] getCurrentUser: uid=", existing.id, "email=", existing.email);
      return existing;
    }
    // Row missing — create it from OAuth metadata (trigger race or missing trigger).
    const meta = authUser.user_metadata ?? {};
    const user = await prisma.user.create({
      data: {
        id: authUser.id,
        email: authUser.email ?? `${authUser.id}@ray.invalid`,
        name: (meta.full_name ?? meta.name ?? null) as string | null,
        avatarUrl: (meta.avatar_url ?? meta.picture ?? null) as string | null,
      },
    });
    console.log("[session] getCurrentUser: created uid=", user.id);
    return user;
  } catch (err) {
    console.error("[session] getCurrentUser prisma error:", err instanceof Error ? err.message : err);
    throw err;
  }
});

/** Throws "Unauthorized" if no session — use to guard protected API routes. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("Unauthorized");
  if (user.isBanned) throw new AuthError("Account suspended");
  console.log("[session] requireUser OK: uid=", user.id);
  return user;
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}
