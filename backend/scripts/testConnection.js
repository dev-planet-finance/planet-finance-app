const { Pool } = require('pg');
require('dotenv').config();

async function testConnection() {
  console.log('🔍 Testing Railway PostgreSQL connection...');
  
  // Try different connection configurations
  const configs = [
    {
      name: 'Direct URL with SSL',
      config: {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      }
    },
    {
      name: 'Direct URL without SSL',
      config: {
        connectionString: process.env.DATABASE_URL,
        ssl: false
      }
    },
    {
      name: 'Parsed connection',
      config: {
        host: 'yamanote.proxy.rlwy.net',
        port: 39114,
        database: 'railway',
        user: 'postgres',
        password: 'bumXFeizMBsVTXanhjxncujQbHnnAsAu',
        ssl: false
      }
    }
  ];

  for (const { name, config } of configs) {
    console.log(`\n🧪 Testing: ${name}`);
    const pool = new Pool(config);
    
    try {
      const result = await pool.query('SELECT NOW(), version()');
      console.log('✅ Success!');
      console.log('   Time:', result.rows[0].now);
      console.log('   Version:', result.rows[0].version.split(' ')[0]);
      
      // Test if tables exist
      const tablesResult = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `);
      
      console.log(`   Tables found: ${tablesResult.rows.length}`);
      if (tablesResult.rows.length > 0) {
        tablesResult.rows.forEach(row => console.log(`     - ${row.table_name}`));
      }
      
      await pool.end();
      return config; // Return working config
      
    } catch (error) {
      console.log('❌ Failed:', error.message);
      await pool.end();
    }
  }
  
  console.log('\n❌ All connection attempts failed');
  return null;
}

testConnection();
