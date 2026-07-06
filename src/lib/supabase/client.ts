"use client";

import { createBrowserClient } from "@supabase/ssr";
import { logger } from "@/lib/logger";

/** Browser Supabase client (anon key). Safe for the client bundle. */
export function createClient() {
  logger.debug("[supabase/client] createClient — browser client instantiated");
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
