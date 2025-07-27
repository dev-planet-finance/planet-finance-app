const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

// Conditionally import Firebase Admin SDK only in production
let admin = null;
if (process.env.NODE_ENV === 'production' && process.env.FIREBASE_PROJECT_ID) {
  admin = require('firebase-admin');
}

// Conditionally import auth middleware
let verifyFirebaseToken = null;
if (admin) {
  const authMiddleware = require('../middleware/auth');
  verifyFirebaseToken = authMiddleware.verifyFirebaseToken;
}

// @route   POST /api/auth/register
// @desc    Register new user with Firebase
// @access  Public
router.post('/register', async (req, res) => {
  const { email, password, displayName } = req.body;

  try {
    console.log('🔥 Creating user:', email);
    
    // Check if we're in development mode or Firebase is not properly configured
    const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.FIREBASE_PROJECT_ID;
    
    if (isDevelopment) {
      console.log('🔧 Development mode: Using mock authentication');
      
      // Generate a mock user ID
      const mockUid = `dev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create a simple JWT-like token for development
      const mockToken = Buffer.from(JSON.stringify({
        uid: mockUid,
        email: email,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      })).toString('base64');
      
      console.log('✅ Mock user created:', mockUid);
      
      res.status(201).json({ 
        success: true,
        message: 'User registered successfully (development mode)', 
        token: mockToken,
        user: {
          uid: mockUid,
          email: email,
          displayName: displayName || email.split('@')[0]
        }
      });
      return;
    }
    
    // Production mode: Use Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName
    });

    console.log('✅ Firebase user created:', userRecord.uid);
    
    // Create custom token for immediate login
    const customToken = await admin.auth().createCustomToken(userRecord.uid);
    
    res.status(201).json({ 
      success: true,
      message: 'User registered successfully', 
      token: customToken,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName
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
    console.log('🔑 Attempting login for:', email);
    
    // Check if we're in development mode
    const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.FIREBASE_API_KEY;
    
    if (isDevelopment) {
      console.log('🔧 Development mode: Using mock authentication');
      
      // Simple validation for development
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      // Generate a mock user ID and token
      const mockUid = `dev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const mockToken = Buffer.from(JSON.stringify({
        uid: mockUid,
        email: email,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      })).toString('base64');
      
      console.log('✅ Mock login successful for:', email);
      
      res.status(200).json({ 
        success: true,
        token: mockToken,
        user: {
          uid: mockUid,
          email: email,
          displayName: email.split('@')[0]
        }
      });
      return;
    }
    
    // Production mode: Use Firebase REST API for login
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

    console.log('✅ Login successful for:', email);
    
    res.status(200).json({ 
      success: true,
      token: data.idToken,
      user: {
        uid: data.localId,
        email: data.email,
        displayName: data.displayName || data.email.split('@')[0]
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
