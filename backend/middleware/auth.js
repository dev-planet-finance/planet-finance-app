const admin = require('firebase-admin');
const { Pool } = require('pg');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Try to use service account file first
    const serviceAccount = require('../firebase-admin-sdk.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id
    });
    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.log('⚠️  Firebase Admin SDK not initialized:', error.message);
    console.log('Please add firebase-admin-sdk.json file to backend folder');
  }
}

// Database connection for user management
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 
    'postgresql://postgres:bumXFeizMBsVTXanhjxncujQbHnnAsAu@yamanote.proxy.rlwy.net:39114/railway',
  ssl: false
});

/**
 * Get or create user in our database based on Firebase UID
 */
const getOrCreateUser = async (firebaseUid, email) => {
  try {
    // First, try to find existing user by Firebase UID
    let query = 'SELECT * FROM users WHERE firebase_uid = $1';
    let result = await pool.query(query, [firebaseUid]);
    
    if (result.rows.length > 0) {
      return result.rows[0];
    }

    // If not found, create new user
    query = `
      INSERT INTO users (firebase_uid, email, display_name, created_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      RETURNING *
    `;
    
    const displayName = email ? email.split('@')[0] : 'User';
    result = await pool.query(query, [firebaseUid, email, displayName]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error getting/creating user:', error);
    throw error;
  }
};

/**
 * Middleware to verify Firebase ID tokens
 */
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No authorization token provided'
      });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // For testing purposes, allow a special test token
    if (idToken === 'TEST_TOKEN_AUTO_USER') {
      req.user = {
        uid: '550e8400-e29b-41d4-a716-446655440001',
        email: 'test@planetfinance.info',
        email_verified: true,
        firebase_uid: '550e8400-e29b-41d4-a716-446655440001',
        database_user: await getOrCreateUser('550e8400-e29b-41d4-a716-446655440001', 'test@planetfinance.info')
      };
      return next();
    }
    
    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Get or create user in our database
    const databaseUser = await getOrCreateUser(decodedToken.uid, decodedToken.email);
    
    // Add user info to request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      email_verified: decodedToken.email_verified,
      firebase_uid: decodedToken.uid,
      database_user: databaseUser
    };

    next();
  } catch (error) {
    console.error('Firebase token verification failed:', error);
    
    let errorMessage = 'Invalid or expired token';
    if (error.code === 'auth/id-token-expired') {
      errorMessage = 'Token has expired. Please log in again.';
    } else if (error.code === 'auth/argument-error') {
      errorMessage = 'Invalid token format';
    }

    return res.status(401).json({
      success: false,
      error: errorMessage
    });
  }
};

/**
 * Optional auth middleware - allows both authenticated and unauthenticated requests
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const idToken = authHeader.split('Bearer ')[1];
      
      // Handle test token
      if (idToken === 'TEST_TOKEN_AUTO_USER') {
        req.user = {
          uid: '550e8400-e29b-41d4-a716-446655440001',
          email: 'test@planetfinance.info',
          email_verified: true,
          firebase_uid: '550e8400-e29b-41d4-a716-446655440001',
          database_user: await getOrCreateUser('550e8400-e29b-41d4-a716-446655440001', 'test@planetfinance.info')
        };
        return next();
      }
      
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const databaseUser = await getOrCreateUser(decodedToken.uid, decodedToken.email);
      
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        email_verified: decodedToken.email_verified,
        firebase_uid: decodedToken.uid,
        database_user: databaseUser
      };
    }
    
    next();
  } catch (error) {
    // If token verification fails, continue without user info
    next();
  }
};

module.exports = {
  verifyFirebaseToken,
  optionalAuth,
  getOrCreateUser
};
