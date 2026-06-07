// Test database connection
import { prisma } from './src/lib/prisma.ts';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    console.log('✅ Database connected successfully!', result);
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
