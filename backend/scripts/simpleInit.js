const databaseService = require('../services/databaseService');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  console.log('🚀 Initializing Railway PostgreSQL database using existing service...');
  
  try {
    // Test connection using existing service
    console.log('📡 Testing database connection...');
    const testResult = await databaseService.pool.query('SELECT NOW()');
    console.log('✅ Database connection successful:', testResult.rows[0].now);

    // Read schema.sql file
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📋 Executing database schema...');
    
    // Execute schema using existing service
    await databaseService.pool.query(schema);
    
    console.log('✅ Database schema initialized successfully!');
    
    // Verify tables were created
    const tablesResult = await databaseService.pool.query(`
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
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run initialization
initializeDatabase();
