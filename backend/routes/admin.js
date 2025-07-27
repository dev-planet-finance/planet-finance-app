const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const databaseService = require('../services/databaseService');
const { verifyFirebaseToken, requireRole } = require('../middleware/auth');

// @route   POST /api/admin/init-database
// @desc    Initialize database schema for MVP launch
// @access  Admin only
router.post('/init-database', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    console.log('🚀 Initializing database schema for MVP launch...');
    
    // Test database connection
    console.log('📡 Testing database connection...');
    const testResult = await databaseService.pool.query('SELECT NOW(), version()');
    console.log('✅ Database connection successful:', testResult.rows[0].now);
    
    // Read schema.sql file
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📋 Executing database schema...');
    
    // Execute schema
    await databaseService.pool.query(schema);
    
    console.log('✅ Database schema initialized successfully!');
    
    // Verify tables were created
    const tablesResult = await databaseService.pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    const tables = tablesResult.rows.map(row => row.table_name);
    console.log('📊 Created tables:', tables);
    
    res.status(200).json({
      success: true,
      message: 'Database schema initialized successfully!',
      tables: tables,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.error('Stack trace:', error.stack);
    
    res.status(500).json({
      success: false,
      error: error.message,
      details: 'Check server logs for more information'
    });
  }
});

// @route   GET /api/admin/database-status
// @desc    Check database connection and table status
// @access  Admin only
router.get('/database-status', verifyFirebaseToken, requireRole('admin'), async (req, res) => {
  try {
    // Test connection
    const testResult = await databaseService.pool.query('SELECT NOW()');
    
    // Check tables
    const tablesResult = await databaseService.pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    res.status(200).json({
      success: true,
      connected: true,
      timestamp: testResult.rows[0].now,
      tables: tablesResult.rows.map(row => row.table_name),
      tableCount: tablesResult.rows.length
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      connected: false,
      error: error.message
    });
  }
});

module.exports = router;
