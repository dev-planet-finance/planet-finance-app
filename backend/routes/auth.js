const express = require('express');
const admin = require('firebase-admin');
const fetch = require('node-fetch');
const { verifyFirebaseToken } = require('../middleware/auth');
const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register new user with Firebase
// @access  Public
router.post('/register', async (req, res) => {
  const { email, password, displayName } = req.body;

  try {
    console.log('🔥 Creating Firebase user:', email);
    
    // Create user in Firebase Auth
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
      uid: userRecord.uid,
      email: userRecord.email,
      customToken
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
    
    // Use Firebase REST API for login
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
      idToken: data.idToken, 
      email: data.email, 
      uid: data.localId,
      refreshToken: data.refreshToken
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
router.post('/logout', verifyFirebaseToken, (req, res) => {
  // Firebase handles logout on client side
  res.json({ 
    success: true,
    message: 'Logout successful' 
  });
});

// @route   GET /api/auth/me
// @desc    Get current user info
// @access  Private
router.get('/me', verifyFirebaseToken, (req, res) => {
  res.json({ 
    success: true,
    user: req.user 
  });
});

module.exports = router;
