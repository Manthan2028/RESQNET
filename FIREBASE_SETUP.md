# 🔥 Firebase Setup Guide - Fix "API Key Not Valid" Error

## ❌ Current Error
```
Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)
```

## ✅ Solution: Configure Firebase Credentials

---

## 🚀 Quick Fix (5 Minutes)

### Step 1: Create Firebase Project

1. Go to **https://console.firebase.google.com/**
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: **"resqnet-demo"** (or any name you prefer)
4. Click **Continue**
5. **Disable Google Analytics** (optional for demo) or keep it enabled
6. Click **Create project**
7. Wait for project creation (takes ~30 seconds)
8. Click **Continue**

### Step 2: Enable Required Services

#### A. Enable Authentication
1. In Firebase Console, click **"Authentication"** in left sidebar
2. Click **"Get started"**
3. Click **"Email/Password"** tab
4. Toggle **"Enable"** switch ON
5. Click **"Save"**

#### B. Create Firestore Database
1. Click **"Firestore Database"** in left sidebar
2. Click **"Create database"**
3. Select **"Start in test mode"** (for demo purposes)
4. Click **"Next"**
5. Choose location closest to you (e.g., "asia-south1" for India)
6. Click **"Enable"**
7. Wait for database creation

#### C. Enable Storage
1. Click **"Storage"** in left sidebar
2. Click **"Get started"**
3. Click **"Next"** (keep default rules for test mode)
4. Choose same location as Firestore
5. Click **"Done"**

### Step 3: Get Firebase Configuration

1. Click the **⚙️ gear icon** (Settings) in left sidebar
2. Click **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Click the **web icon** `</>`  (Add web app)
5. Enter app nickname: **"ResQNet Web"**
6. **DO NOT** check "Firebase Hosting" (not needed)
7. Click **"Register app"**
8. You'll see a code snippet with `firebaseConfig` object
9. **COPY the entire firebaseConfig object** (it looks like this):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

### Step 4: Update Your Code

**Option A: Direct Update (Recommended for Quick Start)**

1. Open: `src/config/firebase.ts`
2. Find lines 10-17 (the firebaseConfig object)
3. Replace the placeholder values with your actual values:

```typescript
const firebaseConfig = {
    apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",  // ← Paste your actual API key
    authDomain: "your-project-id.firebaseapp.com",      // ← Paste your actual auth domain
    projectId: "your-project-id",                       // ← Paste your actual project ID
    storageBucket: "your-project-id.appspot.com",       // ← Paste your actual storage bucket
    messagingSenderId: "123456789012",                  // ← Paste your actual sender ID
    appId: "1:123456789012:web:abcdef1234567890"       // ← Paste your actual app ID
};
```

**Option B: Environment Variables (More Secure)**

1. Create a file named `.env` in the project root (same folder as `package.json`)
2. Add these lines (replace with your actual values):

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

3. **IMPORTANT**: Restart the dev server after creating `.env`:
   - Stop the server (Ctrl+C in terminal)
   - Run `npm run dev` again

### Step 5: Verify Configuration

1. Save the file
2. Refresh your browser (F5)
3. Open browser console (F12)
4. You should NO LONGER see the orange warning about Firebase not configured
5. Try registration again - it should work now!

---

## 🔍 Troubleshooting

### Issue: Still getting "API key not valid" error
**Solutions**:
- ✅ Make sure you copied the ENTIRE API key (starts with "AIza")
- ✅ Check for extra spaces or quotes
- ✅ Verify you're using values from YOUR Firebase project
- ✅ If using `.env`, restart the dev server

### Issue: "Permission denied" errors
**Solution**: Update Firestore Security Rules (temporary for demo):
1. Go to Firestore Database → Rules
2. Replace with:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```
3. Click "Publish"

### Issue: Can't upload images
**Solution**: Update Storage Security Rules:
1. Go to Storage → Rules
2. Replace with:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```
3. Click "Publish"

---

## ✅ Verification Checklist

After configuration, verify:
- [ ] No orange warning in browser console
- [ ] Registration completes successfully
- [ ] User is created in Firebase Authentication
- [ ] User profile saved in Firestore (check "users" collection)
- [ ] Login works with created account
- [ ] Dashboard loads based on role

---

## 📝 Example Configuration

Here's what a properly configured `firebase.ts` looks like:

```typescript
const firebaseConfig = {
    apiKey: "AIzaSyBxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxX",
    authDomain: "resqnet-demo.firebaseapp.com",
    projectId: "resqnet-demo",
    storageBucket: "resqnet-demo.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abc123def456ghi789"
};
```

**Note**: These are example values - use YOUR actual values from Firebase Console!

---

## 🎯 Quick Summary

1. **Create Firebase project** at console.firebase.google.com
2. **Enable** Authentication (Email/Password)
3. **Create** Firestore Database (test mode)
4. **Enable** Storage
5. **Copy** firebaseConfig from Project Settings
6. **Paste** into `src/config/firebase.ts` (lines 10-17)
7. **Save** and refresh browser
8. **Test** registration - should work now!

---

## 🆘 Still Having Issues?

If you're still stuck:
1. Check browser console for specific error messages
2. Verify all Firebase services are enabled
3. Make sure you're using the correct project
4. Try creating a new Firebase project and starting fresh

---

**After following these steps, your registration should work perfectly!** 🎉
