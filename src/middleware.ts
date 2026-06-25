import { type NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Refreshes the Supabase session cookie on every request and gates the
 * protected route groups. Public browsing is allowed; posting / chat /
 * favorites / profile / admin require a session.
 *
 * IMPORTANT: This runs on Edge Runtime. Never import Prisma, Node-only
 * modules, or anything that requires the Node.js runtime here.
 *
 * The entire body is wrapped in try/catch so a Supabase timeout or
 * transient network error returns a pass-through instead of a 500.
 * Auth is enforced again at the API/server-component layer, so letting
 * a request through on middleware failure is safe.
 */
const PROTECTED_PREFIXES = ["/sell", "/chat", "/favorites", "/profile", "/admin"];

export async function middleware(request: NextRequest) {
  try {
    let response = NextResponse.next({ request });

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return response;

    const supabase = createServerClient(url, key, {
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

    const { pathname } = request.nextUrl;

    if (pathname === "/" && request.cookies.get("ray_visited")?.value === "1") {
      const rUrl = request.nextUrl.clone();
      rUrl.pathname = "/home";
      return NextResponse.redirect(rUrl);
    }

    if (pathname === "/login" && user) {
      const rUrl = request.nextUrl.clone();
      const raw = request.nextUrl.searchParams.get("redirect") ?? "/home";
      const safe =
        raw.startsWith("/") && !raw.startsWith("//") && !raw.includes(":") && !raw.includes("%") && raw !== "/login"
          ? raw
          : "/home";
      rUrl.pathname = safe;
      rUrl.search = "";
      return NextResponse.redirect(rUrl);
    }

    const needsAuth = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

    if (needsAuth && !user) {
      const rUrl = request.nextUrl.clone();
      rUrl.pathname = "/login";
      rUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(rUrl);
    }

    return response;
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)"],
};
