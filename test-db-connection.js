const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Attempting to connect to Supabase...');
    await client.connect();
    console.log('✅ Connection successful!');
    
    const result = await client.query('SELECT NOW()');
    console.log('Database time:', result.rows[0]);
    
    await client.end();
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    console.error('Full error:', err);
  }
}

testConnection();
