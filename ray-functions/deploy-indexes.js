/**
 * MongoDB Index Deployment Script
 * Run this script once after creating your MongoDB database
 * 
 * Usage:
 *   node deploy-indexes.js
 * 
 * Prerequisites:
 *   - MongoDB connection string in .env file
 *   - MongoDB Node.js driver installed
 */

const { MongoClient } = require('mongodb')
require('dotenv').config()

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env file')
  process.exit(1)
}

async function deployIndexes() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')

    const db = client.db('ray')

    // ─── LISTINGS COLLECTION ───────────────────────
    console.log('\n📦 Creating indexes for listings collection...')
    const listings = db.collection('listings')

    await listings.createIndex({ status: 1, postedAt: -1 })
    console.log('  ✓ status + postedAt')

    await listings.createIndex({ status: 1, category: 1, postedAt: -1 })
    console.log('  ✓ status + category + postedAt')

    await listings.createIndex({ status: 1, 'location.district': 1, postedAt: -1 })
    console.log('  ✓ status + location.district + postedAt')

    await listings.createIndex({ status: 1, price: 1 })
    console.log('  ✓ status + price')

    await listings.createIndex({ 'seller.id': 1, status: 1 })
    console.log('  ✓ seller.id + status')

    await listings.createIndex({ isFeatured: 1, status: 1, postedAt: -1 })
    console.log('  ✓ isFeatured + status + postedAt')

    await listings.createIndex({ title: 'text', description: 'text', tags: 'text' })
    console.log('  ✓ text search (title + description + tags)')

    await listings.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
    console.log('  ✓ TTL index on expiresAt')

    // ─── USERS COLLECTION ──────────────────────────
    console.log('\n👤 Creating indexes for users collection...')
    const users = db.collection('users')

    await users.createIndex({ firebaseUid: 1 }, { unique: true })
    console.log('  ✓ firebaseUid (unique)')

    await users.createIndex({ phone: 1 }, { unique: true })
    console.log('  ✓ phone (unique)')

    await users.createIndex({ 'location.district': 1 })
    console.log('  ✓ location.district')

    await users.createIndex({ 'location.neighborhood': 1 })
    console.log('  ✓ location.neighborhood')

    await users.createIndex({ displayName: 'text' })
    console.log('  ✓ text search (displayName)')

    await users.createIndex({ isBanned: 1, createdAt: -1 })
    console.log('  ✓ isBanned + createdAt')

    // ─── REPORTS COLLECTION ────────────────────────
    console.log('\n🚨 Creating indexes for reports collection...')
    const reports = db.collection('reports')

    await reports.createIndex({ status: 1, createdAt: -1 })
    console.log('  ✓ status + createdAt')

    await reports.createIndex({ reportedItemId: 1 })
    console.log('  ✓ reportedItemId')

    await reports.createIndex({ reporterId: 1 })
    console.log('  ✓ reporterId')

    // ─── BOOSTS COLLECTION ─────────────────────────
    console.log('\n🚀 Creating indexes for boosts collection...')
    const boosts = db.collection('boosts')

    await boosts.createIndex({ userId: 1, createdAt: -1 })
    console.log('  ✓ userId + createdAt')

    await boosts.createIndex({ listingId: 1 })
    console.log('  ✓ listingId')

    await boosts.createIndex({ status: 1, endDate: 1 })
    console.log('  ✓ status + endDate')

    await boosts.createIndex({ createdAt: 1 })
    console.log('  ✓ createdAt (for analytics)')

    console.log('\n✅ All indexes created successfully!')
    console.log('\n📊 Index Summary:')
    console.log(`  Listings: ${(await listings.indexes()).length} indexes`)
    console.log(`  Users: ${(await users.indexes()).length} indexes`)
    console.log(`  Reports: ${(await reports.indexes()).length} indexes`)
    console.log(`  Boosts: ${(await boosts.indexes()).length} indexes`)

  } catch (error) {
    console.error('❌ Error deploying indexes:', error)
    process.exit(1)
  } finally {
    await client.close()
    console.log('\n🔌 Disconnected from MongoDB')
  }
}

deployIndexes()
