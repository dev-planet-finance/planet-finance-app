'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Sign up function
  async function signup(email, password, displayName) {
    try {
      setError('');
      
      // Use backend API for registration
      const { authAPI } = await import('@/lib/api');
      const response = await authAPI.register({
        email,
        password,
        displayName: displayName || email.split('@')[0]
      });
      
      if (response.data.success) {
        // Store the backend token
        const token = response.data.token;
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', token);
          localStorage.setItem('userEmail', email);
          localStorage.setItem('displayName', displayName || email.split('@')[0]);
        }
        
        // Set current user state
        setCurrentUser({
          uid: response.data.user.uid,
          email: email,
          displayName: displayName || email.split('@')[0]
        });
        
        console.log('✅ Backend signup successful, token stored');
        return response.data;
      } else {
        throw new Error(response.data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('❌ Signup error:', error);
      setError(error.response?.data?.error || error.message);
      throw error;
    }
  }

  // Login function
  async function login(email, password) {
    try {
      setError('');
      
      // Use backend API for login
      const { authAPI } = await import('@/lib/api');
      const response = await authAPI.login({ email, password });
      
      if (response.data.success) {
        // Store the backend token
        const token = response.data.token;
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', token);
          localStorage.setItem('userEmail', email);
          localStorage.setItem('displayName', response.data.user.displayName || email.split('@')[0]);
        }
        
        // Set current user state
        setCurrentUser({
          uid: response.data.user.uid,
          email: email,
          displayName: response.data.user.displayName || email.split('@')[0]
        });
        
        console.log('✅ Backend login successful, token stored');
        return response.data;
      } else {
        throw new Error(response.data.error || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setError(error.response?.data?.error || error.message);
      throw error;
    }
  }

  // Logout function
  async function logout() {
    try {
      setError('');
      
      // Use backend API for logout
      const { authAPI } = await import('@/lib/api');
      await authAPI.logout();
      
      // Clear stored tokens and user data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('firebaseToken');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('displayName');
      }
      
      // Clear current user state
      setCurrentUser(null);
      
      console.log('✅ Backend logout successful');
      return { success: true };
    } catch (error) {
      console.error('❌ Logout error:', error);
      setError(error.response?.data?.error || error.message);
      throw error;
    }
  }

  // Get current user token
  async function getToken() {
    if (currentUser) {
      return await currentUser.getIdToken();
    }
    return null;
  }

  useEffect(() => {
    // Initialize auth state from stored tokens (backend integration)
    const initializeAuth = async () => {
      try {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('authToken');
          const email = localStorage.getItem('userEmail');
          const displayName = localStorage.getItem('displayName');
          
          if (token && email) {
            // Verify token with backend
            const { authAPI } = await import('@/lib/api');
            try {
              const response = await authAPI.getCurrentUser();
              if (response.data.success) {
                setCurrentUser({
                  uid: response.data.user.uid,
                  email: email,
                  displayName: displayName || email.split('@')[0]
                });
                console.log('✅ Auth state restored from backend');
              }
            } catch (error) {
              console.log('⚠️ Token invalid, clearing auth state');
              localStorage.removeItem('authToken');
              localStorage.removeItem('userEmail');
              localStorage.removeItem('displayName');
            }
          }
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const value = {
    currentUser,
    login,
    signup,
    logout,
    getToken,
    error,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
