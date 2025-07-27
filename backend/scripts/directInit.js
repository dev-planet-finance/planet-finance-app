const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initializeDatabase() {
  console.log('🚀 Direct database initialization for MVP launch...');
  
  // Use exact same configuration as databaseService
  let connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    connectionString = 'postgresql://postgres:bumXFeizMBsVTXanhjxncujQbHnnAsAu@yamanote.proxy.rlwy.net:39114/railway';
    console.log('⚠️ Using fallback database connection');
  }
  
  connectionString = connectionString.replace(/railwayDB_HOST=[^/]+/, 'railway');
  console.log('Database connection string:', connectionString.replace(/:[^:@]*@/, ':***@'));
  
  const pool = new Pool({
    connectionString: connectionString,
    ssl: false, // Try without SSL first
    max: 5,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
  });

  try {
    console.log('📡 Testing database connection...');
    const testResult = await pool.query('SELECT NOW(), version()');
    console.log('✅ Database connection successful!');
    console.log('   Time:', testResult.rows[0].now);
    console.log('   Version:', testResult.rows[0].version.split(' ')[0]);

    // Read and execute schema
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    console.log('📋 Reading schema from:', schemaPath);
    
    const schema = fs.readFileSync(schemaPath, 'utf8');
    console.log('📋 Executing database schema...');
    
    await pool.query(schema);
    console.log('✅ Database schema executed successfully!');
    
    // Verify tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('📊 Created tables:');
    tablesResult.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });
    
    console.log(`\n🎉 Database initialization complete! Created ${tablesResult.rows.length} tables.`);
    console.log('🚀 Your Planet Finance app is now ready for MVP launch!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    
    // Try with SSL if first attempt fails
    if (error.message.includes('SSL') || error.message.includes('connection')) {
      console.log('🔄 Retrying with SSL enabled...');
      
      const sslPool = new Pool({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false },
        max: 5,
        idleTimeoutMillis: 10000,
        connectionTimeoutMillis: 5000,
      });
      
      try {
        const testResult = await sslPool.query('SELECT NOW()');
        console.log('✅ SSL connection successful!');
        
        const schema = fs.readFileSync(path.join(__dirname, '../database/schema.sql'), 'utf8');
        await sslPool.query(schema);
        
        const tablesResult = await sslPool.query(`
          SELECT table_name FROM information_schema.tables 
          WHERE table_schema = 'public' ORDER BY table_name;
        `);
        
        console.log('📊 Created tables:');
        tablesResult.rows.forEach(row => console.log(`  ✓ ${row.table_name}`));
        console.log(`\n🎉 Database initialization complete! Created ${tablesResult.rows.length} tables.`);
        
        await sslPool.end();
        return;
        
      } catch (sslError) {
        console.error('❌ SSL connection also failed:', sslError.message);
        await sslPool.end();
      }
    }
    
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initializeDatabase();
