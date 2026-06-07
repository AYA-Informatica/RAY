import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Safe redirect: only allow paths that start with "/" and contain no
 * protocol or double-slash (prevents open-redirect attacks).
 */
function safeRedirect(raw: string | null): string {
  if (!raw) return "/home";
  const stripped = raw.trim();
  if (!stripped.startsWith("/") || stripped.startsWith("//") || stripped.includes(":")) {
    return "/home";
  }
  return stripped;
}

/** Exchanges the OAuth code for a session, then redirects back into the app. */
export async function GET(request: Request) {
  const { searchParams, origin: requestOrigin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirect = safeRedirect(searchParams.get("redirect"));

  // Prefer the explicit site URL env var so post-OAuth redirects always land
  // on the real domain, not a Vercel deployment URL.
  const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || requestOrigin;

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${redirect}`);
    }
  }
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
