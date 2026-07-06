"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";

/**
 * Listens for Supabase auth state changes. If the session is forcibly signed
 * out (refresh token expired, account deleted, etc.), redirects to /login so
 * the user is never silently stranded in an unauthenticated state.
 * Renders nothing — attach once in the root layout.
 */
export function AuthWatcher() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      logger.debug({ event }, "[AuthWatcher] auth state changed");
      if (event === "SIGNED_OUT") {
        logger.debug({}, "[AuthWatcher] session signed out, redirecting to login");
        router.push("/login");
      }
    });
    return () => subscription.unsubscribe();
  }, [router]);

  return null;
}
