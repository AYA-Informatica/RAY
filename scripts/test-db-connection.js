/**
 * Test script to verify database connection
 * Run: node scripts/test-db-connection.js
 */

const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

  try {
    console.log('Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'));
    
    // Simple query to test connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connection successful!');
    console.log('Result:', result);
    
    // Try to fetch categories
    const categories = await prisma.category.findMany({ take: 1 });
    console.log('✅ Category query successful!');
    console.log('Categories:', categories.length);
    
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
