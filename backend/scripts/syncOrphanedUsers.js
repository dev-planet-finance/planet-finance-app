require('dotenv').config();
const admin = require('firebase-admin');
const databaseService = require('../services/databaseService');

// Initialize Firebase Admin SDK using the same pattern as backend
let firebaseInitialized = false;

try {
  if (!admin.apps.length) {
    // Validate required environment variables
    const requiredVars = [
      'FIREBASE_PROJECT_ID',
      'FIREBASE_PRIVATE_KEY_ID', 
      'FIREBASE_PRIVATE_KEY',
      'FIREBASE_CLIENT_EMAIL',
      'FIREBASE_CLIENT_ID'
    ];
    
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
    
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID
    });
    
    firebaseInitialized = true;
    console.log('🔥 Firebase Admin SDK initialized successfully');
  }
} catch (error) {
  console.error('❌ Firebase Admin SDK initialization failed:', error.message);
  process.exit(1);
}

async function syncOrphanedUsers() {
  console.log('🔄 Starting orphaned user sync...');
  
  try {
    // Get all Firebase users
    console.log('📋 Fetching all Firebase users...');
    const listUsersResult = await admin.auth().listUsers();
    const firebaseUsers = listUsersResult.users;
    
    console.log(`📊 Found ${firebaseUsers.length} Firebase users`);
    
    // Get all PostgreSQL users
    console.log('📋 Fetching all PostgreSQL users...');
    const pgResult = await databaseService.pool.query('SELECT firebase_uid FROM users');
    const pgUserIds = new Set(pgResult.rows.map(row => row.firebase_uid));
    
    console.log(`📊 Found ${pgUserIds.size} PostgreSQL users`);
    
    // Find orphaned users (in Firebase but not in PostgreSQL)
    const orphanedUsers = firebaseUsers.filter(user => !pgUserIds.has(user.uid));
    
    console.log(`🔍 Found ${orphanedUsers.length} orphaned users to sync`);
    
    if (orphanedUsers.length === 0) {
      console.log('✅ No orphaned users found - all users are synced!');
      return;
    }
    
    // Sync each orphaned user
    for (const user of orphanedUsers) {
      try {
        console.log(`🔄 Syncing user: ${user.email} (${user.uid})`);
        
        const insertUserQuery = `
          INSERT INTO users (firebase_uid, email, display_name, subscription_tier, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
          RETURNING *
        `;
        
        const userValues = [
          user.uid,
          user.email,
          user.displayName || user.email.split('@')[0],
          'free',
          new Date(user.metadata.creationTime)
        ];
        
        const dbResult = await databaseService.pool.query(insertUserQuery, userValues);
        console.log(`✅ Synced user ${user.email} - PostgreSQL ID: ${dbResult.rows[0].id}`);
        
      } catch (error) {
        console.error(`❌ Failed to sync user ${user.email}:`, error.message);
      }
    }
    
    console.log('🎉 Orphaned user sync completed!');
    
  } catch (error) {
    console.error('❌ Error during user sync:', error);
  } finally {
    process.exit(0);
  }
}

// Run the sync
syncOrphanedUsers();
