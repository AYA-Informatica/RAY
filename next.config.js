const withPWA = require("next-pwa")({
  dest: "public",
  // Disable in dev to avoid noisy service-worker caching during local work.
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  // Don't precache the API or Next data routes.
  buildExcludes: [/middleware-manifest\.json$/],
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
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/webp"],
    remotePatterns: [
      // Supabase Storage public buckets. Replace <project-ref> after provisioning.
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(self), geolocation=(self), microphone=()" },
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
