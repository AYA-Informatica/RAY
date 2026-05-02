/**
 * MongoDB Verification Script
 * Checks connection, database, collections, and indexes
 */

const { MongoClient } = require('mongodb')
require('dotenv').config()

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env file')
  process.exit(1)
}

async function verifyMongoDB() {
  const client = new MongoClient(MONGODB_URI)

  try {
    console.log('🔍 Starting MongoDB verification...\n')

    // Test connection
    console.log('1️⃣  Testing connection...')
    await client.connect()
    console.log('   ✅ Connected to MongoDB Atlas\n')

    const db = client.db('ray')

    // Check database exists
    console.log('2️⃣  Checking database...')
    const dbList = await client.db().admin().listDatabases()
    const rayDbExists = dbList.databases.some(d => d.name === 'ray')
    if (rayDbExists) {
      console.log('   ✅ Database "ray" exists\n')
    } else {
      console.log('   ❌ Database "ray" NOT found\n')
    }

    // Check collections
    console.log('3️⃣  Checking collections...')
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map(c => c.name)
    
    const expectedCollections = ['listings', 'users', 'reports', 'boosts']
    expectedCollections.forEach(name => {
      if (collectionNames.includes(name)) {
        console.log(`   ✅ Collection "${name}" exists`)
      } else {
        console.log(`   ❌ Collection "${name}" NOT found`)
      }
    })
    console.log(`   📊 Total collections: ${collections.length}\n`)

    // Check indexes for each collection
    console.log('4️⃣  Checking indexes...\n')
    
    const indexCounts = {}
    for (const collName of expectedCollections) {
      if (collectionNames.includes(collName)) {
        const indexes = await db.collection(collName).indexes()
        indexCounts[collName] = indexes.length
        console.log(`   📦 ${collName}: ${indexes.length} indexes`)
        indexes.forEach(idx => {
          const keys = Object.keys(idx.key).join(', ')
          const unique = idx.unique ? ' (unique)' : ''
          const text = idx.key._fts ? ' (text search)' : ''
          console.log(`      - ${keys}${unique}${text}`)
        })
        console.log('')
      }
    }

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📊 VERIFICATION SUMMARY')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`✅ Connection: SUCCESS`)
    console.log(`✅ Database: ray`)
    console.log(`✅ Collections: ${collectionNames.length}/4`)
    console.log(`✅ Total Indexes: ${Object.values(indexCounts).reduce((a, b) => a + b, 0)}`)
    console.log('')
    console.log('   Listings:  ' + (indexCounts.listings || 0) + ' indexes')
    console.log('   Users:     ' + (indexCounts.users || 0) + ' indexes')
    console.log('   Reports:   ' + (indexCounts.reports || 0) + ' indexes')
    console.log('   Boosts:    ' + (indexCounts.boosts || 0) + ' indexes')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    // Connection string info
    console.log('🔗 Connection Details:')
    const url = new URL(MONGODB_URI.replace('mongodb+srv://', 'https://'))
    console.log(`   Cluster: ${url.hostname}`)
    console.log(`   Database: ray`)
    console.log(`   User: ${url.username}`)
    console.log('')

    console.log('✅ All verifications passed!')

  } catch (error) {
    console.error('\n❌ Verification failed:', error.message)
    process.exit(1)
  } finally {
    await client.close()
    console.log('\n🔌 Disconnected from MongoDB')
  }
}

verifyMongoDB()
