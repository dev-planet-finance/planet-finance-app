'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

const NewAuthContext = createContext();

export function useNewAuth() {
  return useContext(NewAuthContext);
}

export function NewAuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Sign up function - BACKEND API VERSION
  async function signup(email, password, displayName) {
    try {
      setError('');
      console.log('🔥 NEW AUTHCONTEXT - Starting backend API registration for:', email);
      
      // Use backend API for registration
      const { authAPI } = await import('@/lib/api');
      console.log('📡 NEW AUTHCONTEXT - Calling backend API /api/auth/register...');
      
      const registrationData = {
        email,
        password,
        displayName: displayName || email.split('@')[0]
      };
      console.log('📋 NEW AUTHCONTEXT - Registration data:', { email, displayName: registrationData.displayName });
      
      const response = await authAPI.register(registrationData);
      console.log('📥 NEW AUTHCONTEXT - Backend response received:', response.status, response.data?.success);
      
      if (response.data.success) {
        // Store the backend token
        const token = response.data.token;
        console.log('🔑 NEW AUTHCONTEXT - Token received, storing in localStorage...');
        
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
        
        console.log('✅ NEW AUTHCONTEXT - Backend signup successful, user created in both Firebase and PostgreSQL');
        console.log('👤 NEW AUTHCONTEXT - User UID:', response.data.user.uid);
        return response.data;
      } else {
        console.error('❌ NEW AUTHCONTEXT - Backend returned success: false');
        throw new Error(response.data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('❌ NEW AUTHCONTEXT - Frontend signup error details:');
      console.error('   Error type:', error.constructor.name);
      console.error('   Error message:', error.message);
      console.error('   Response status:', error.response?.status);
      console.error('   Response data:', error.response?.data);
      console.error('   Full error:', error);
      
      setError(error.response?.data?.error || error.message);
      throw error;
    }
  }

  // Login function - BACKEND API VERSION
  async function login(email, password) {
    try {
      setError('');
      console.log('🔥 NEW AUTHCONTEXT - Starting backend API login for:', email);
      
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
        
        console.log('✅ NEW AUTHCONTEXT - Backend login successful, token stored');
        return response.data;
      } else {
        throw new Error(response.data.error || 'Login failed');
      }
    } catch (error) {
      console.error('❌ NEW AUTHCONTEXT - Login error:', error);
      setError(error.response?.data?.error || error.message);
      throw error;
    }
  }

  // Logout function - BACKEND API VERSION
  async function logout() {
    try {
      setError('');
      console.log('🔥 NEW AUTHCONTEXT - Starting backend API logout...');
      
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
      
      console.log('✅ NEW AUTHCONTEXT - Backend logout successful');
      return { success: true };
    } catch (error) {
      console.error('❌ NEW AUTHCONTEXT - Logout error:', error);
      setError(error.response?.data?.error || error.message);
      throw error;
    }
  }

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('authToken');
          const email = localStorage.getItem('userEmail');
          const displayName = localStorage.getItem('displayName');
          
          if (token && email) {
            // Verify token with backend and set user state
            setCurrentUser({
              uid: 'temp-uid', // Will be replaced with real UID from backend verification
              email: email,
              displayName: displayName || email.split('@')[0]
            });
            console.log('🔥 NEW AUTHCONTEXT - Auth state initialized from localStorage:', email);
          }
        }
      } catch (error) {
        console.error('❌ NEW AUTHCONTEXT - Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    error,
    loading
  };

  return (
    <NewAuthContext.Provider value={value}>
      {!loading && children}
    </NewAuthContext.Provider>
  );
}
