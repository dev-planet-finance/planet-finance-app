const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initializeDatabase() {
  console.log('🚀 Initializing Railway PostgreSQL database for MVP launch...');
  
  // Use exact same configuration as working database service
  let connectionString = process.env.DATABASE_URL;
  
  // Fallback to hardcoded Railway connection if needed
  if (!connectionString) {
    connectionString = 'postgresql://postgres:bumXFeizMBsVTXanhjxncujQbHnnAsAu@yamanote.proxy.rlwy.net:39114/railway';
    console.log('⚠️ Using fallback database connection');
  }
  
  // Clean up any malformed connection string
  connectionString = connectionString.replace(/railwayDB_HOST=[^/]+/, 'railway');
  
  console.log('Database connection string:', connectionString.replace(/:[^:@]*@/, ':***@'));
  
  const pool = new Pool({
    connectionString: connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  try {
    // Test connection
    console.log('📡 Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');

    // Read schema.sql file
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📋 Executing database schema...');
    
    // Execute schema
    await pool.query(schema);
    
    console.log('✅ Database schema initialized successfully!');
    
    // Verify tables were created
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('📊 Created tables:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    console.log('🎉 Database initialization complete! Ready for MVP launch.');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run initialization
initializeDatabase();
