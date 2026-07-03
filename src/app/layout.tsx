import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { I18nProvider, parseLocale } from "@/i18n";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "RAY — Buy & Sell Anything Near You",
    template: "%s · RAY",
  },
  description:
    "RAY is a modern hyperlocal marketplace for East Africa. Buy, sell, rent and discover trusted deals near you in Kigali and beyond.",
  applicationName: "RAY",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "RAY" },
  icons: { apple: "/icons/apple-touch-icon.png" },
  openGraph: {
    type: "website",
    siteName: "RAY",
    title: "RAY — Buy & Sell Anything Near You",
    description: "The hyperlocal marketplace for East Africa.",
    url: siteUrl,
  },
  twitter: { card: "summary_large_image", title: "RAY", description: "Buy & Sell Anything Near You" },
};

export const viewport: Viewport = {
  themeColor: "#111111",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = parseLocale((await cookies()).get("ray_locale")?.value);
  return (
    <html
      lang={locale}
      suppressHydrationWarning
    >
      <head>
        {/* Load Google Fonts at runtime — avoids build-time network dependency.
            eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        {/* font-display=swap in the URL means the browser renders fallback fonts
            immediately and swaps in web fonts when ready — no render blocking. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap"
        />
      </head>
      <body className="min-h-dvh bg-background">
        <I18nProvider initialLocale={locale}>{children}</I18nProvider>
        {/* Only inject on Vercel — scripts 404 on localhost and in plain npm run start */}
        {process.env.NEXT_PUBLIC_VERCEL_ENV && <SpeedInsights />}
        {process.env.NEXT_PUBLIC_VERCEL_ENV && <Analytics />}
      </body>
    </html>
  );
}
