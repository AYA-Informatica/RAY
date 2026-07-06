import { type NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { logger } from "@/lib/logger";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Refreshes the Supabase session cookie and gates protected routes.
 *
 * Key optimization: supabase.auth.getUser() is a network round-trip to
 * Supabase. We only pay that cost when the route actually needs auth —
 * public routes (home, listings, search) pass through with zero Supabase
 * overhead.
 *
 * IMPORTANT: Edge Runtime only. Never import Prisma or Node-only modules.
 */
const PROTECTED_PREFIXES = ["/sell", "/chat", "/favorites", "/profile", "/admin"];

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    logger.debug({ method: request.method, pathname }, "[middleware] request");

    // Redirect returning visitors from landing → home feed without any auth call.
    if (pathname === "/" && request.cookies.get("ray_visited")?.value === "1") {
      logger.debug({ pathname }, "[middleware] redirect returning visitor to /home");
      const rUrl = request.nextUrl.clone();
      rUrl.pathname = "/home";
      return NextResponse.redirect(rUrl);
    }

    const needsAuth = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
    const isLoginPage = pathname === "/login";

    // Public routes: pass through immediately — no Supabase round-trip.
    if (!needsAuth && !isLoginPage) {
      return NextResponse.next({ request });
    }

    // Auth-gated path: build the Supabase client and fetch the session.
    let response = NextResponse.next({ request });

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      logger.warn({ pathname }, "[middleware] Supabase env vars missing — skipping auth gate");
      return response;
    }

    const supabase = createServerClient(url, key, { // NOSONAR S1874 — uses getAll/setAll (non-deprecated overload); SonarLint resolves to any and misidentifies it
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (isLoginPage && user) {
      const rUrl = request.nextUrl.clone();
      const raw = request.nextUrl.searchParams.get("redirect") ?? "/home";
      const safe =
        raw.startsWith("/") && !raw.startsWith("//") && !raw.includes(":") && !raw.includes("%") && raw !== "/login"
          ? raw
          : "/home";
      rUrl.pathname = safe;
      rUrl.search = "";
      logger.debug({ redirectTo: safe }, "[middleware] authed user redirected off /login");
      return NextResponse.redirect(rUrl);
    }

    if (needsAuth && !user) {
      logger.warn({ pathname }, "[middleware] blocked unauthenticated request to protected route");
      const rUrl = request.nextUrl.clone();
      rUrl.pathname = "/login";
      rUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(rUrl);
    }

    return response;
  } catch (err) {
    logger.warn({ err: err instanceof Error ? err.message : err }, "[middleware] unexpected error — passing request through");
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)"],
};
