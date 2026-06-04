/**
 * Test raw PostgreSQL connection (no Prisma)
 * Run: node scripts/test-raw-connection.js
 */

const { Client } = require('pg');

const PASSWORD = 'RizJtBVnwCMm7fpX';

const configs = [
  {
    name: 'Session Pooler',
    connectionString: `postgresql://postgres.afipvqridgcfauinbqnr:${PASSWORD}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`,
  },
  {
    name: 'Direct Connection',
    connectionString: `postgresql://postgres.afipvqridgcfauinbqnr:${PASSWORD}@aws-0-eu-west-1.pooler.supabase.com:5432/postgres`,
  },
];

async function testConnection(name, connectionString) {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    const result = await client.query('SELECT 1 as test');
    console.log(`✅ ${name} - SUCCESS`);
    console.log('   Query result:', result.rows[0]);
    return true;
  } catch (error) {
    console.log(`❌ ${name} - FAILED`);
    console.log(`   Error: ${error.message}`);
    return false;
  } finally {
    await client.end();
  }
}

async function runTests() {
  console.log('Testing PostgreSQL connections...\n');
  
  for (const { name, connectionString } of configs) {
    await testConnection(name, connectionString);
    console.log('');
  }
}

runTests();
