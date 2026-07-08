const { withSentryConfig } = require("@sentry/nextjs");

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  // Disable in dev to avoid noisy service-worker caching during local work.
  disable: process.env.NODE_ENV === "development",
  // Serve /offline when a navigation request fails (user is fully offline).
  fallbacks: { document: "/offline" },
  workboxOptions: {
    // Don't precache the API or Next data routes.
    skipWaiting: true,
    clientsClaim: true,
    exclude: [/middleware-manifest\.json$/, /\.js\.map$/],
    runtimeCaching: [
      {
        // Listing/avatar/chat images from Supabase Storage — cache-first, capped.
        urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "ray-images",
          expiration: { maxEntries: 200, maxAgeSeconds: 7 * 24 * 60 * 60 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      {
        // Google Fonts files.
        urlPattern: /^https:\/\/fonts\.(gstatic|googleapis)\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "ray-fonts",
          expiration: { maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      {
        // App shell / static assets — stale-while-revalidate for snappy revisits.
        urlPattern: /\.(?:js|css|woff2?|png|jpg|jpeg|svg|webp|ico)$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "ray-static",
          expiration: { maxEntries: 120, maxAgeSeconds: 30 * 24 * 60 * 60 },
        },
      },
      {
        // Never cache API responses (auth, chat, search must be fresh).
        urlPattern: /\/api\/.*/i,
        handler: "NetworkOnly",
        options: {},
      },
      {
        // HTML pages — network-first so users get fresh content, offline fallback.
        urlPattern: ({ request }) => request.mode === "navigate",
        handler: "NetworkFirst",
        options: {
          cacheName: "ray-pages",
          networkTimeoutSeconds: 5,
          expiration: { maxEntries: 60, maxAgeSeconds: 24 * 60 * 60 },
        },
      },
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // next-pwa injects a webpack plugin; this empty turbopack config tells Next.js 16
  // the coexistence is intentional and silences the "webpack config but no turbopack
  // config" fatal error in dev (PWA is disabled in dev anyway).
  turbopack: {},
  // Improve Fast Refresh stability
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
  images: {
    formats: ["image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  async headers() {
    const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://*.supabase.co";
    const isDev = process.env.NODE_ENV === "development";
    // CSP: tight policy for RAY's stack.
    // - scripts/styles: self only (Tailwind is inlined at build; no CDN scripts)
    // - connect: self + Supabase (auth, DB, realtime, storage) + Upstash (rate limit)
    // - img: self + Supabase storage + data URIs (canvas-compressed WebP blobs)
    // - frame/object: deny (no embeds)
    // - 'unsafe-eval' is dev-only: next.js fast-refresh runtime requires it
    const csp = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://vercel.live`,
      `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://vercel.live`,
      `img-src 'self' data: blob: https://*.supabase.co https://lh3.googleusercontent.com https://images.unsplash.com https://vercel.live https://vercel.com`,
      // fonts.googleapis.com + fonts.gstatic.com must be in connect-src because
      // the Workbox service worker uses fetch() for runtime font caching, and
      // fetch() is governed by connect-src, not font-src.
      `connect-src 'self' ${supabaseOrigin} https://*.supabase.co wss://*.supabase.co https://*.upstash.io https://vercel.live https://nominatim.openstreetmap.org https://fonts.googleapis.com https://fonts.gstatic.com https://*.ingest.de.sentry.io`,
      `font-src 'self' https://fonts.gstatic.com https://vercel.live https://assets.vercel.com`,
      `frame-src https://vercel.live`,
      `object-src 'none'`,
      `base-uri 'self'`,
      `form-action 'self'`,
      // upgrade-insecure-requests must be omitted in dev: it tells the browser to
      // convert http:// → https:// for all subrequests, which breaks localhost.
      !isDev && `upgrade-insecure-requests`,
    ].filter(Boolean).join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(self), geolocation=(self), microphone=()" },
        ],
      },
    ];
  },
};

module.exports = withSentryConfig(withPWA(nextConfig), {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Only print Sentry build output in CI; stay quiet locally
  silent: !process.env.CI,
  // Upload source maps so stack traces in Sentry show original TS lines
  widenClientFileUpload: true,
  // Don't serve source maps to browsers in production
  hideSourceMaps: true,
  // Tree-shake Sentry debug logger out of the production bundle
  bundleSizeOptimizations: { excludeDebugStatements: true },
});
