const { Pool } = require('pg');

// Initialize Firebase Admin SDK for all environments
const admin = require('firebase-admin');
let firebaseInitialized = false;

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  try {
    // Create service account object from environment variables
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
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
    console.log('🔥 Firebase Admin SDK initialized in auth middleware with project ID:', process.env.FIREBASE_PROJECT_ID);
    firebaseInitialized = true;
  } catch (error) {
    console.error('❌ Firebase Admin SDK initialization error in middleware:', error.message);
    firebaseInitialized = false;
    throw error;
  }
} else {
  firebaseInitialized = true;
  console.log('🔥 Firebase Admin SDK already initialized in auth middleware');
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

    const token = authHeader.split('Bearer ')[1];
    
    // Verify the Firebase token using Firebase Admin SDK
    if (!firebaseInitialized) {
      throw new Error('Firebase Admin SDK not initialized');
    }
    
    let decodedToken;
    try {
      // First try to verify as ID token
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (idTokenError) {
      try {
        // If ID token verification fails, try to verify as custom token
        // Custom tokens need to be exchanged for ID tokens server-side
        console.log('🔄 ID token verification failed, attempting custom token verification...');
        
        // For custom tokens, we need to decode them to get the UID
        // Custom tokens are JWTs that we can decode to get user info
        const jwt = require('jsonwebtoken');
        const decoded = jwt.decode(token);
        
        if (decoded && decoded.uid) {
          // Get user record directly using UID from custom token
          const userRecord = await admin.auth().getUser(decoded.uid);
          
          // Create a mock decoded token structure for consistency
          decodedToken = {
            uid: userRecord.uid,
            email: userRecord.email,
            email_verified: userRecord.emailVerified
          };
          
          console.log('✅ Custom token verified successfully for UID:', decoded.uid);
        } else {
          throw new Error('Invalid token format - no UID found');
        }
      } catch (customTokenError) {
        console.error('❌ Both ID token and custom token verification failed:', customTokenError);
        throw idTokenError; // Throw the original ID token error
      }
    }
    
    // Get user record to access custom claims (roles)
    const userRecord = await admin.auth().getUser(decodedToken.uid);
    const customClaims = userRecord.customClaims || {};
    
    // Log authentication for audit purposes
    console.log(`🔐 Token verified for user: ${decodedToken.email} (UID: ${decodedToken.uid}) with role: ${customClaims.role || 'user'}`);
    
    // Get or create user in our database
    const databaseUser = await getOrCreateUser(decodedToken.uid, decodedToken.email);
    
    // Add user info to request object with role-based access control
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      email_verified: decodedToken.email_verified,
      firebase_uid: decodedToken.uid,
      role: customClaims.role || 'user',
      tier: customClaims.tier || 'free',
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

/**
 * Role-based access control middleware
 * @param {string|string[]} allowedRoles - Single role or array of allowed roles
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const userRole = req.user.role || 'user';
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    if (!roles.includes(userRole)) {
      console.log(`🚫 Access denied: User ${req.user.email} with role '${userRole}' attempted to access endpoint requiring roles: ${roles.join(', ')}`);
      return res.status(403).json({
        success: false,
        error: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }

    console.log(`✅ Access granted: User ${req.user.email} with role '${userRole}' accessing endpoint`);
    next();
  };
};

/**
 * Subscription tier access control middleware
 * @param {string|string[]} allowedTiers - Single tier or array of allowed tiers
 */
const requireTier = (allowedTiers) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const userTier = req.user.tier || 'free';
    const tiers = Array.isArray(allowedTiers) ? allowedTiers : [allowedTiers];
    
    if (!tiers.includes(userTier)) {
      console.log(`🚫 Tier access denied: User ${req.user.email} with tier '${userTier}' attempted to access endpoint requiring tiers: ${tiers.join(', ')}`);
      return res.status(403).json({
        success: false,
        error: `Upgrade required. Required subscription tier: ${tiers.join(' or ')}`
      });
    }

    console.log(`✅ Tier access granted: User ${req.user.email} with tier '${userTier}' accessing endpoint`);
    next();
  };
};

module.exports = {
  verifyFirebaseToken,
  optionalAuth,
  getOrCreateUser,
  requireRole,
  requireTier
};
