# ResQNet - Quick Setup Guide

## ⚡ Quick Start (5 Minutes)

### Step 1: Install Dependencies (2 min)

Open PowerShell as Administrator and run:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then in your project directory:

```powershell
npm install
```

### Step 2: Firebase Setup (3 min)

1. **Create Firebase Project**
   - Go to https://console.firebase.google.com/
   - Click "Add project"
   - Enter project name: "resqnet-demo"
   - Disable Google Analytics (optional for demo)
   - Click "Create project"

2. **Enable Authentication**
   - In Firebase Console, go to "Authentication"
   - Click "Get started"
   - Click "Email/Password" → Enable → Save

3. **Create Firestore Database**
   - Go to "Firestore Database"
   - Click "Create database"
   - Select "Start in test mode"
   - Choose location (closest to you)
   - Click "Enable"

4. **Enable Storage**
   - Go to "Storage"
   - Click "Get started"
   - Start in test mode
   - Click "Done"

5. **Get Firebase Config**
   - Click the gear icon → Project settings
   - Scroll to "Your apps"
   - Click the web icon (</>)
   - Register app name: "ResQNet"
   - Copy the firebaseConfig object

6. **Update Config File**
   - Open `src/config/firebase.ts`
   - Replace the placeholder config with your copied config

### Step 3: Run the App

```powershell
npm run dev
```

The app will open at http://localhost:3000

## 🎭 Demo Accounts to Create

For a complete demo, create these accounts:

### Account 1: Normal User
- Email: user@demo.com
- Password: demo123
- Role: Normal User
- Name: John Doe
- Phone: +91 98765 43210
- City: Mumbai

### Account 2: Volunteer
- Email: volunteer@demo.com
- Password: demo123
- Role: Volunteer
- Name: Sarah Smith
- Phone: +91 98765 43211
- City: Mumbai
- Category: Medical

### Account 3: Agency
- Email: agency@demo.com
- Password: demo123
- Role: Agency
- Authority: Mumbai Control Room
- Department: Emergency Response
- City: Mumbai

## 🎬 Demo Flow

1. **Register as Normal User** → Report an emergency
2. **Login as Volunteer** → Accept the incident → Add update
3. **Login as Agency** → View analytics → Manage incident
4. **Show all three dashboards** side by side

## 🔧 Common Issues

### Issue: "Cannot load scripts" error
**Solution**: Run PowerShell as Administrator:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue: Firebase errors
**Solution**: 
- Check if you copied the entire config object
- Verify Authentication is enabled
- Verify Firestore is created

### Issue: Map not showing
**Solution**: 
- Check internet connection
- Clear browser cache
- Try different browser

### Issue: Location not working
**Solution**: 
- Click "Allow" when browser asks for location
- Use HTTPS (or localhost is fine)

## 📱 Testing on Mobile

1. Find your computer's IP address:
   ```powershell
   ipconfig
   ```
   Look for "IPv4 Address"

2. Update vite.config.ts:
   ```typescript
   server: {
     host: '0.0.0.0',
     port: 3000
   }
   ```

3. On mobile, visit: `http://YOUR_IP:3000`

## 🎯 Hackathon Presentation Tips

1. **Start with the problem** - Show why crisis response needs better coordination
2. **Demo the user flow** - Normal User → Volunteer → Agency
3. **Highlight real-time features** - Show map updating live
4. **Show the volunteer community** - Emphasize community-driven response
5. **Discuss scalability** - Firebase can handle real-world load

## 🚀 Next Steps for Production

- [ ] Add proper Firebase security rules
- [ ] Implement SMS notifications
- [ ] Add offline support with PWA
- [ ] Integrate actual emergency services APIs
- [ ] Add incident categories and filtering
- [ ] Implement volunteer verification process
- [ ] Add multi-language support
- [ ] Create mobile apps (React Native)

---

**Need help? Check README.md for detailed documentation**
