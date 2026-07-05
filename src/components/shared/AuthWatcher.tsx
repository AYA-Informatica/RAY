"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
      if (event === "SIGNED_OUT") {
        router.push("/login");
      }
    });
    return () => subscription.unsubscribe();
  }, [router]);

  return null;
}
