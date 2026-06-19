import { type NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Refreshes the Supabase session cookie on every request and gates the
 * protected route groups. Public browsing is allowed; posting / chat /
 * favorites / profile / admin require a session.
 *
 * Ban check and admin role check are enforced in the server components /
 * API layer (requireUser, requireStaff) — not here, because middleware
 * runs on Edge Runtime where Prisma is unavailable.
 */
const PROTECTED_PREFIXES = ["/sell", "/chat", "/favorites", "/profile", "/admin"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Returning visitors who hit "/" go straight to /home — skips the splash entirely.
  if (pathname === "/" && request.cookies.get("ray_visited")?.value === "1") {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }

  // Already authenticated — kick them out of /login back to where they wanted to go.
  if (pathname === "/login" && user) {
    const url = request.nextUrl.clone();
    const raw = request.nextUrl.searchParams.get("redirect") ?? "/home";
    const safe =
      raw.startsWith("/") && !raw.startsWith("//") && !raw.includes(":") && raw !== "/login"
        ? raw
        : "/home";
    url.pathname = safe;
    url.search = "";
    return NextResponse.redirect(url);
  }

  const needsAuth = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  if (needsAuth && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)"],
};
