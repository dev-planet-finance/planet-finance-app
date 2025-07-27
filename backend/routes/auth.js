const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

// Import Firebase Admin SDK
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  try {
    // Validate required Firebase environment variables
    const requiredEnvVars = {
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      FIREBASE_PRIVATE_KEY_ID: process.env.FIREBASE_PRIVATE_KEY_ID,
      FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
      FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
      FIREBASE_CLIENT_ID: process.env.FIREBASE_CLIENT_ID
    };

    const missingVars = Object.entries(requiredEnvVars)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      throw new Error(`Missing required Firebase environment variables: ${missingVars.join(', ')}`);
    }

    // Create service account object from environment variables
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
    console.log('🔥 Firebase Admin SDK initialized successfully for project:', process.env.FIREBASE_PROJECT_ID);
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
    console.error('📝 Please ensure all Firebase environment variables are set in your .env file:');
    console.error('   - FIREBASE_PROJECT_ID');
    console.error('   - FIREBASE_PRIVATE_KEY_ID');
    console.error('   - FIREBASE_PRIVATE_KEY');
    console.error('   - FIREBASE_CLIENT_EMAIL');
    console.error('   - FIREBASE_CLIENT_ID');
    process.exit(1);
  }
}

// Import auth middleware
const authMiddleware = require('../middleware/auth');
const verifyFirebaseToken = authMiddleware.verifyFirebaseToken;

// @route   POST /api/auth/register
// @desc    Register new user with Firebase
// @access  Public
router.post('/register', async (req, res) => {
  const { email, password, displayName } = req.body;

  try {
    console.log('🔥 Creating user with Firebase Admin SDK:', email);
    
    // Create user in Firebase Auth using Admin SDK
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: displayName || email.split('@')[0],
      emailVerified: false
    });

    console.log('✅ Firebase user created:', userRecord.uid);
    
    // Set custom claims for role-based access control
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role: 'user',
      tier: 'free',
      createdAt: new Date().toISOString()
    });
    
    console.log('✅ Custom claims set successfully');
    
    // Create corresponding user record in PostgreSQL database
    const databaseService = require('../services/databaseService');
    try {
      const insertUserQuery = `
        INSERT INTO users (firebase_uid, email, display_name, subscription_tier, created_at, updated_at)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `;
      
      const userValues = [
        userRecord.uid,
        userRecord.email,
        userRecord.displayName || displayName || email.split('@')[0],
        'free'
      ];
      
      const dbResult = await databaseService.pool.query(insertUserQuery, userValues);
      console.log('✅ PostgreSQL user record created:', dbResult.rows[0].id);
      
    } catch (dbError) {
      console.error('⚠️ Failed to create PostgreSQL user record:', dbError.message);
      // Continue with Firebase token creation even if DB insert fails
    }
    
    // Create a temporary sign-in to get ID token
    // Since we created the user with Admin SDK, we need to generate an ID token
    // We'll use a custom token temporarily to get the ID token
    const customToken = await admin.auth().createCustomToken(userRecord.uid, {
      role: 'user',
      tier: 'free'
    });
    
    // Log user creation for audit purposes
    console.log(`📝 User registered: ${email} (UID: ${userRecord.uid}) with role: user`);
    console.log(`🔑 Returning custom token for frontend exchange: ${customToken.substring(0, 50)}...`);
    
    res.status(201).json({ 
      success: true,
      message: 'User registered successfully with Firebase Auth', 
      token: customToken,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName || displayName || email.split('@')[0],
        role: 'user',
        tier: 'free',
        emailVerified: userRecord.emailVerified
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Registration failed' 
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user with Firebase
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('🔑 Attempting Firebase Auth login for:', email);
    
    // Use Firebase REST API for authentication
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password, 
          returnSecureToken: true 
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Login failed');
    }

    // Get user record to retrieve custom claims (roles)
    const userRecord = await admin.auth().getUser(data.localId);
    const customClaims = userRecord.customClaims || {};
    
    // Log user login for audit purposes
    console.log(`📝 User logged in: ${email} (UID: ${data.localId}) with role: ${customClaims.role || 'user'}`);
    
    res.status(200).json({ 
      success: true,
      token: data.idToken,
      user: {
        uid: data.localId,
        email: data.email,
        displayName: data.displayName || userRecord.displayName || data.email.split('@')[0],
        role: customClaims.role || 'user',
        tier: customClaims.tier || 'free',
        emailVerified: userRecord.emailVerified
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(401).json({ 
      success: false,
      error: error.message || 'Login failed' 
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', (req, res) => {
  // In development mode, just return success
  // In production, Firebase handles logout on client side
  res.json({ 
    success: true,
    message: 'Logout successful' 
  });
});

// @route   GET /api/auth/me
// @desc    Get current user info
// @access  Private
router.get('/me', (req, res) => {
  // In development mode, return mock user info
  // In production, this would use Firebase token verification
  res.json({ 
    success: true,
    user: req.user 
  });
});

module.exports = router;
