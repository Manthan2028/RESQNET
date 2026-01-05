import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
// You can either:
// 1. Replace these values directly, OR
// 2. Create a .env file with VITE_FIREBASE_* variables
// TODO: PASTE YOUR FIREBASE KEYS HERE
// 1. Go to Firebase Console > Project Settings > General > Your apps
// 2. Copy the values and paste them below
// Firebase configuration using Environment Variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// DEBUG: Verify keys are loaded (Redacted for security)
console.log("Firebase Config Status:", {
    apiKeyLoaded: !!firebaseConfig.apiKey,
    projectId: firebaseConfig.projectId,
    mode: import.meta.env.MODE
});

// Check if Firebase is configured
const isConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";

if (!isConfigured) {
    console.warn(
        '%c⚠️ Firebase Not Configured',
        'color: orange; font-size: 16px; font-weight: bold;',
        '\n\nPlease update src/config/firebase.ts with your Firebase credentials.\n' +
        'Get them from: https://console.firebase.google.com/\n' +
        'Project Settings > Your apps > SDK setup and configuration\n'
    );
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Set persistence to LOCAL (survives browser restarts)
if (isConfigured) {
    setPersistence(auth, browserLocalPersistence).catch(console.error);
}

export default app;
export { isConfigured };
