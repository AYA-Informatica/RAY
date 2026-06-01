#!/usr/bin/env node
// ============================================================================
// RAY — generate-secrets.js
// Generates cryptographically secure random strings for environment variables.
// Usage:  node scripts/generate-secrets.js
// ============================================================================

const { randomBytes } = require("crypto");

/** Generate a URL-safe hex string of `bytes` random bytes. */
function secret(bytes = 48) {
  return randomBytes(bytes).toString("hex");
}

const secrets = {
  CRON_SECRET: secret(48),       // 96-char hex  — protects /api/cron/* endpoints
};

console.log("\n🔐 RAY — Generated Secrets\n");
console.log("Copy these into your .env and Vercel environment variables.\n");
console.log("─".repeat(72));

for (const [key, value] of Object.entries(secrets)) {
  console.log(`\n${key}`);
  console.log(`  ${value}`);
}

console.log("\n─".repeat(72));
console.log(`
⚠️  SECURITY REMINDERS
  • Never commit these values to Git.
  • Add them to Vercel via: Dashboard → Project → Settings → Environment Variables
  • Rotate them if you suspect compromise.
  • CRON_SECRET must match what you set in Vercel Cron → Authorization header.

📋 ALREADY CONFIGURED (no need to regenerate)
  • NEXT_PUBLIC_SUPABASE_URL       → in your .env / .env.production
  • NEXT_PUBLIC_SUPABASE_ANON_KEY  → in your .env / .env.production
  • SUPABASE_SERVICE_ROLE_KEY      → in your .env / .env.production
  • DATABASE_URL / DIRECT_URL      → in your .env / .env.production
  • UPSTASH_REDIS_REST_URL/TOKEN   → in your .env / .env.production
  • Google OAuth                   → configured inside Supabase Dashboard
                                     (no env vars needed in this app)
`);
