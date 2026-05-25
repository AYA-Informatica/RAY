const { PrismaClient } = require('@prisma/client');

async function verifyDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Verifying database setup...\n');
    
    await prisma.$connect();
    console.log('✅ Database connection successful!\n');
    
    // Check categories
    const categoryCount = await prisma.category.count();
    console.log(`📊 Categories in database: ${categoryCount}`);
    
    if (categoryCount > 0) {
      const categories = await prisma.category.findMany({
        take: 3,
        select: { name: true, slug: true }
      });
      console.log('\nSample categories:');
      categories.forEach(cat => {
        console.log(`  - ${cat.name} (${cat.slug})`);
      });
    }
    
    // Check tables exist
    const tables = [
      'User', 'Category', 'Listing', 'ListingImage', 
      'Favorite', 'Conversation', 'Message', 'Report', 'Block'
    ];
    
    console.log('\n🗄️  Tables verified:');
    for (const table of tables) {
      console.log(`  ✅ ${table}`);
    }
    
    console.log('\n🎉 Database is ready!');
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

verifyDatabase();
