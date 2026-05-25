#!/usr/bin/env node

/**
 * RAY Environment Setup Helper
 * Generates secure random strings for environment variables
 * 
 * Usage:
 *   node scripts/generate-secrets.js
 */

const crypto = require('crypto');

console.log('\n🔐 RAY Environment Secret Generator\n');
console.log('=' .repeat(60));

// Generate CRON_SECRET (48 bytes = 96 hex characters)
const cronSecret = crypto.randomBytes(48).toString('hex');
console.log('\n📅 CRON_SECRET (for Vercel Cron jobs):');
console.log(cronSecret);
console.log('\n💡 This protects your /api/cron/expire-listings endpoint');

// Generate additional secrets if needed in the future
const nextauthSecret = crypto.randomBytes(32).toString('hex');
console.log('\n\n🔑 NEXTAUTH_SECRET (if you add NextAuth later):');
console.log(nextauthSecret);

console.log('\n' + '='.repeat(60));
console.log('\n✅ Copy these values to your .env file or Vercel Dashboard\n');
console.log('⚠️  IMPORTANT: Keep these secrets secure and never commit them!\n');
