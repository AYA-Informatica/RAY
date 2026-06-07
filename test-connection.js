require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n');
  
  // Test with pooled connection
  console.log('1️⃣ Testing POOLED connection (port 6543)...');
  const pooledClient = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
  
  try {
    await pooledClient.$connect();
    console.log('✅ Pooled connection successful!\n');
    await pooledClient.$disconnect();
  } catch (error) {
    console.error('❌ Pooled connection failed:', error.message, '\n');
  }

  // Test with direct connection
  console.log('2️⃣ Testing DIRECT connection (port 5432)...');
  const directClient = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DIRECT_URL,
      },
    },
  });
  
  try {
    await directClient.$connect();
    const result = await directClient.$queryRaw`SELECT NOW() as current_time`;
    console.log('✅ Direct connection successful!');
    console.log('   Current DB time:', result[0].current_time, '\n');
    await directClient.$disconnect();
  } catch (error) {
    console.error('❌ Direct connection failed:', error.message, '\n');
  }

  // Check environment variables
  console.log('3️⃣ Checking environment variables...');
  console.log('   DATABASE_URL exists:', !!process.env.DATABASE_URL);
  console.log('   DIRECT_URL exists:', !!process.env.DIRECT_URL);
  
  if (process.env.DATABASE_URL) {
    const dbUrl = new URL(process.env.DATABASE_URL);
    console.log('   Pooled host:', dbUrl.hostname);
    console.log('   Pooled port:', dbUrl.port);
  }
  
  if (process.env.DIRECT_URL) {
    const directUrl = new URL(process.env.DIRECT_URL);
    console.log('   Direct host:', directUrl.hostname);
    console.log('   Direct port:', directUrl.port);
  }
}

testConnection()
  .catch(console.error)
  .finally(() => process.exit());
