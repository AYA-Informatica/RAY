import type { Metadata, Viewport } from "next";
import { Syne, DM_Sans } from "next/font/google";
import { cookies } from "next/headers";
import { I18nProvider, parseLocale } from "@/i18n/I18nProvider";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

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
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = parseLocale(cookies().get("ray_locale")?.value);
  return (
    <html
      lang={locale}
      className={`${syne.variable} ${dmSans.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-background">
        <I18nProvider initialLocale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
