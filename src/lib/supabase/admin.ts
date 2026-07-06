import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";

/**
 * Service-role client. BYPASSES RLS. Server-only. Never import into a
 * "use client" file. Used for the admin API + privileged tasks.
 */
export function createAdminClient() {
  logger.debug("[supabase/admin] createAdminClient — service-role client instantiated");
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
