import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { logger } from "@/lib/logger";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/** Server Supabase client wired to Next.js cookies (RSC + route handlers). */
export async function createClient() {
  const cookieStore = await cookies();
  logger.debug("[supabase/server] createClient — server client instantiated");
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — safe to ignore; middleware refreshes.
            logger.debug("[supabase/server] setAll skipped — called from a Server Component");
          }
        },
      },
    },
  );
}
