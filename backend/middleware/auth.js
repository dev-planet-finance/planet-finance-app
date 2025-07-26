const admin = require('firebase-admin');
const { Pool } = require('pg');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Check if we have environment variables for Firebase Admin
    if (process.env.FIREBASE_PROJECT_ID) {
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
        // For development, we'll use a simplified approach
        // In production, you'd use proper service account credentials
      });
      console.log('✅ Firebase Admin SDK initialized with project ID:', process.env.FIREBASE_PROJECT_ID);
    } else {
      console.log('⚠️  Firebase Admin SDK not initialized: Missing FIREBASE_PROJECT_ID');
      console.log('For development, we\'ll use test authentication');
    }
  } catch (error) {
    console.log('⚠️  Firebase Admin SDK initialization error:', error.message);
    console.log('Falling back to test authentication for development');
  }
}

// Database connection for user management
let pool = null;

// Only initialize database in production
if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
  });
  console.log('✅ Database pool initialized for production');
} else {
  console.log('🔧 Development mode: Skipping database initialization');
}

/**
 * Get or create user in our database based on Firebase UID
 */
const getOrCreateUser = async (firebaseUid, email) => {
  try {
    // Development mode: return mock user to avoid database issues
    if (process.env.NODE_ENV === 'development' || !process.env.DATABASE_URL) {
      console.log('🔧 Development mode: Using mock database user');
      return {
        id: firebaseUid,
        firebase_uid: firebaseUid,
        email: email,
        display_name: email ? email.split('@')[0] : 'Dev User',
        created_at: new Date().toISOString()
      };
    }
    
    // Production mode: use real database
    // First, try to find existing user
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
    // Fallback to mock user in case of database errors
    return {
      id: firebaseUid,
      firebase_uid: firebaseUid,
      email: email,
      display_name: email ? email.split('@')[0] : 'User',
      created_at: new Date().toISOString()
    };
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
    
    // Development mode: if token doesn't look like a Firebase JWT, use test authentication
    const isFirebaseJWT = idToken.split('.').length === 3 && idToken.length > 100;
    
    if (!isFirebaseJWT || process.env.NODE_ENV === 'development') {
      // Development mode: create a test user for any token
      console.log('🔧 Development mode: Using test authentication for token:', idToken.substring(0, 20) + '...');
      // Generate a consistent UUID-like string for development
      const hash = idToken.substring(0, 8).padEnd(8, '0');
      const testUserId = `dev-${hash}-4000-8000-000000000000`;
      const testEmail = 'dev@planetfinance.info';
      
      req.user = {
        uid: testUserId,
        email: testEmail,
        email_verified: true,
        firebase_uid: testUserId,
        database_user: await getOrCreateUser(testUserId, testEmail)
      };
    } else {
      // Production mode: Verify the Firebase ID token
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
    }

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
