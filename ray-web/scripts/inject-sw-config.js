// scripts/inject-sw-config.js
// Run this as part of the build: node scripts/inject-sw-config.js
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env manually (dotenv not available in scripts)
const envPath = resolve(__dirname, '../.env')
let envContent = ''
try {
  envContent = readFileSync(envPath, 'utf-8')
} catch {
  console.warn('[inject-sw-config] No .env file found — skipping SW injection')
  process.exit(0)
}

const env = Object.fromEntries(
  envContent
    .split('\n')
    .filter((line) => line.includes('=') && !line.startsWith('#'))
    .map((line) => {
      const [key, ...rest] = line.split('=')
      return [key.trim(), rest.join('=').trim()]
    })
)

const swPath = resolve(__dirname, '../public/firebase-messaging-sw.js')
let sw = readFileSync(swPath, 'utf-8')

// Targeted replacements by field name
const fields = {
  apiKey:            env.VITE_FIREBASE_API_KEY,
  authDomain:        env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             env.VITE_FIREBASE_APP_ID,
}

for (const [field, value] of Object.entries(fields)) {
  sw = sw.replace(
    new RegExp(`(${field}:\\s*)"REPLACE_WITH_ACTUAL_VALUE"`),
    `$1"${value ?? ''}"`
  )
}

writeFileSync(swPath, sw)
console.log('[inject-sw-config] Service worker config injected successfully')
