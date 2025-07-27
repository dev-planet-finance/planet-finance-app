import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase configuration - using same config as backend
const firebaseConfig = {
  apiKey: "AIzaSyBWqjCGb18I_95rdgFDi5nKQ40N2iJNQlk",
  authDomain: "planet-finance-app.firebaseapp.com",
  projectId: "planet-finance-app",
  storageBucket: "planet-finance-app.appspot.com",
  messagingSenderId: "116478888517497821684",
  appId: "1:116478888517497821684:web:planet-finance-app"
};

// Initialize Firebase only if no apps exist
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const isFirebaseConfigured = true; // Always true since we have hardcoded config
export default app;
