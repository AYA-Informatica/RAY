/**
 * Test different connection string formats
 */

const { PrismaClient } = require('@prisma/client');

const PASSWORD = 'RizJtBVnwCMm7fpX';
const HOST = 'aws-1-eu-central-1.pooler.supabase.com';
const DB_NAME = 'postgres';

const connectionStrings = [
  {
    name: 'Session Pooler (port 6543)',
    url: `postgresql://postgres.paocrurwdkwxkbfizgfm:${PASSWORD}@${HOST}:6543/${DB_NAME}?pgbouncer=true&connection_limit=1`,
  },
  {
    name: 'Direct Connection (port 5432)',
    url: `postgresql://postgres.paocrurwdkwxkbfizgfm:${PASSWORD}@${HOST}:5432/${DB_NAME}`,
  },
  {
    name: 'Session Pooler without params',
    url: `postgresql://postgres.paocrurwdkwxkbfizgfm:${PASSWORD}@${HOST}:6543/${DB_NAME}`,
  },
  {
    name: 'Using postgres user (not postgres.project)',
    url: `postgresql://postgres:${PASSWORD}@${HOST}:6543/${DB_NAME}?pgbouncer=true&connection_limit=1`,
  },
];

async function testConnection(name, url) {
  const prisma = new PrismaClient({
    datasources: { db: { url } },
    log: ['error'],
  });

  try {
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log(`✅ ${name} - SUCCESS`);
    return true;
  } catch (error) {
    console.log(`❌ ${name} - FAILED: ${error.message.split('\n')[0]}`);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function runTests() {
  console.log('Testing connection strings...\n');
  
  for (const { name, url } of connectionStrings) {
    await testConnection(name, url);
  }
  
  console.log('\n--- Test complete ---');
}

runTests();
