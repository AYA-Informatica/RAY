const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log('Testing Supabase connection...\n');
  
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });
  
  try {
    console.log('Attempting to connect...');
    await prisma.$connect();
    console.log('✅ Connection successful!\n');
    
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT NOW() as now`;
    console.log('Database time:', result);
    
    await prisma.$disconnect();
    console.log('\n✅ All tests passed!');
  } catch (err) {
    console.error('\n❌ Connection failed!');
    console.error('Error message:', err.message);
    console.error('Error code:', err.code);
    if (err.meta) {
      console.error('Error details:', JSON.stringify(err.meta, null, 2));
    }
    process.exit(1);
  }
}

testConnection();
