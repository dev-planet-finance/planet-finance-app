const { Pool } = require('pg');
require('dotenv').config();

async function testRailwayConnection() {
  console.log('🔍 Testing Railway PostgreSQL connectivity...');
  
  const connectionString = process.env.DATABASE_URL;
  console.log('Connection string:', connectionString.replace(/:[^:@]*@/, ':***@'));
  
  // Parse the connection string to get host and port
  const url = new URL(connectionString);
  const host = url.hostname;
  const port = url.port;
  
  console.log(`\n🌐 Testing connection to ${host}:${port}`);
  
  // Try a very simple connection with minimal configuration
  const pool = new Pool({
    connectionString: connectionString,
    ssl: false,
    max: 1,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 5000,
  });

  try {
    console.log('📡 Attempting connection...');
    const client = await pool.connect();
    console.log('✅ Connection established!');
    
    const result = await client.query('SELECT 1 as test');
    console.log('✅ Query executed successfully:', result.rows[0]);
    
    client.release();
    console.log('🎉 Railway PostgreSQL is accessible!');
    
    return true;
    
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    console.log('Error code:', error.code);
    
    // Try with SSL
    console.log('\n🔄 Trying with SSL...');
    const sslPool = new Pool({
      connectionString: connectionString,
      ssl: { rejectUnauthorized: false },
      max: 1,
      connectionTimeoutMillis: 10000,
    });
    
    try {
      const client = await sslPool.connect();
      console.log('✅ SSL connection established!');
      
      const result = await client.query('SELECT 1 as test');
      console.log('✅ SSL query executed successfully:', result.rows[0]);
      
      client.release();
      await sslPool.end();
      console.log('🎉 Railway PostgreSQL is accessible with SSL!');
      
      return true;
      
    } catch (sslError) {
      console.log('❌ SSL connection also failed:', sslError.message);
      await sslPool.end();
      return false;
    }
    
  } finally {
    await pool.end();
  }
}

testRailwayConnection().then(success => {
  if (!success) {
    console.log('\n🚨 Railway PostgreSQL is not accessible from this machine.');
    console.log('💡 Possible solutions:');
    console.log('   1. Check Railway service status');
    console.log('   2. Verify network connectivity');
    console.log('   3. Try from a different network');
    console.log('   4. Check if Railway requires IP whitelisting');
  }
  process.exit(success ? 0 : 1);
});
