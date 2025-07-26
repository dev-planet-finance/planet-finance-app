#!/usr/bin/env node

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

/**
 * Automatic Firebase Token Generator for Testing
 * This script creates Firebase custom tokens for seamless API testing
 */

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Try to use service account key if available
    const serviceAccountPath = path.join(__dirname, '..', 'firebase-service-account.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = require(serviceAccountPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID || 'planet-finance-app'
      });
    } else {
      // Fallback to application default credentials
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID || 'planet-finance-app'
      });
    }
  } catch (error) {
    console.error('Firebase Admin initialization failed:', error.message);
    console.log('\n🔧 For seamless testing, you can:');
    console.log('1. Use the TEST_TOKEN_AUTO_USER for development');
    console.log('2. Set up Firebase service account key');
    console.log('3. Use Firebase Auth emulator\n');
    process.exit(1);
  }
}

/**
 * Generate custom token for testing
 */
async function generateTestToken(uid = 'test-user-001', claims = {}) {
  try {
    const customClaims = {
      email: 'test@planetfinance.info',
      email_verified: true,
      role: 'user',
      ...claims
    };

    const customToken = await admin.auth().createCustomToken(uid, customClaims);
    
    console.log('🎉 Firebase Custom Token Generated Successfully!');
    console.log('📋 Copy this token for API testing:\n');
    console.log(`Bearer ${customToken}`);
    console.log('\n📝 Use in curl commands like:');
    console.log(`curl -H "Authorization: Bearer ${customToken}" http://localhost:5000/api/portfolios`);
    console.log('\n⏰ Token expires in 1 hour');
    
    return customToken;
  } catch (error) {
    console.error('Error generating custom token:', error);
    throw error;
  }
}

/**
 * Create test user in Firebase Auth (if needed)
 */
async function createTestUser(uid, email, password = 'testpassword123') {
  try {
    const userRecord = await admin.auth().createUser({
      uid: uid,
      email: email,
      password: password,
      emailVerified: true,
      displayName: 'Test User'
    });
    
    console.log('✅ Test user created:', userRecord.uid);
    return userRecord;
  } catch (error) {
    if (error.code === 'auth/uid-already-exists') {
      console.log('ℹ️ Test user already exists');
      return await admin.auth().getUser(uid);
    }
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'token';
  
  switch (command) {
    case 'token':
      const uid = args[1] || 'test-user-001';
      await generateTestToken(uid);
      break;
      
    case 'user':
      const userUid = args[1] || 'test-user-001';
      const userEmail = args[2] || 'test@planetfinance.info';
      await createTestUser(userUid, userEmail);
      await generateTestToken(userUid);
      break;
      
    case 'help':
      console.log('🔥 Firebase Token Generator for Planet Finance');
      console.log('\nUsage:');
      console.log('  node generateTestToken.js token [uid]     - Generate token');
      console.log('  node generateTestToken.js user [uid] [email] - Create user + token');
      console.log('  node generateTestToken.js help           - Show this help');
      console.log('\nExamples:');
      console.log('  node generateTestToken.js token');
      console.log('  node generateTestToken.js user john@test.com');
      break;
      
    default:
      console.log('Unknown command. Use "help" for usage information.');
  }
  
  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateTestToken, createTestUser };
