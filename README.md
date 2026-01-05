# ResQNet - Integrated Crisis Response & Community Resource Platform

## 🚨 Project Overview

ResQNet is a hackathon-ready MVP for crisis reporting, verification, community-based response, and resource coordination. The platform provides real-time incident tracking with a city-wide live map visible to all users.

## 🎯 Key Features

### Three Role-Based User Types:
1. **Normal User** - Report emergencies and track incidents
2. **Volunteer** - Respond to incidents and provide on-ground updates
3. **Agency/Control Room** - Manage and coordinate emergency response

### Core Functionality:
- ✅ One-time detailed registration with role selection
- ✅ Automatic session persistence (no repeated logins)
- ✅ Real-time city-wide incident map with color-coded status pins
- ✅ GPS-based incident reporting
- ✅ Photo/video upload support
- ✅ Volunteer assignment and tracking
- ✅ Live status updates and notifications
- ✅ City-wise volunteer community management
- ✅ Analytics dashboard for agencies

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (Light Theme Only)
- **Backend**: Node.js + Express
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Maps**: Leaflet (OpenStreetMap)
- **Storage**: Firebase Storage

## 📋 Prerequisites

Before running this project, ensure you have:

- Node.js (v18 or higher)
- npm or yarn
- A Firebase project with:
  - Authentication enabled (Email/Password)
  - Firestore Database
  - Storage bucket

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable Authentication (Email/Password provider)
4. Create a Firestore Database (Start in test mode for demo)
5. Enable Storage
6. Go to Project Settings > Your apps > Add web app
7. Copy the Firebase configuration

### 3. Update Firebase Config

Open `src/config/firebase.ts` and replace the placeholder config with your actual Firebase credentials:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 4. Firestore Security Rules (For Demo)

In Firebase Console > Firestore Database > Rules, use these rules for demo purposes:

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

### 5. Storage Security Rules (For Demo)

In Firebase Console > Storage > Rules:

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

## 🎮 Running the Application

### Development Mode

```bash
npm run dev
```

The app will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📱 User Flows

### First-Time User Registration

1. Open the app → Redirected to registration
2. **Step 1**: Enter email and password
3. **Step 2**: Select role (Normal User / Volunteer / Agency)
4. **Step 3**: Complete role-specific profile
5. Auto-login and redirect to appropriate dashboard

### Returning User

- Automatically logged in
- Redirected directly to role-based dashboard
- No login required

### Normal User Flow

1. Dashboard with prominent "REPORT EMERGENCY" button
2. Fill incident form (type, severity, description, photo)
3. GPS location auto-captured
4. View incident on live map
5. Track incident status in real-time

### Volunteer Flow

1. View city-wide incidents on map
2. Browse available incidents
3. Accept incident to respond
4. Provide on-ground updates with photos
5. Update incident status (Verified → In Progress → Resolved)

### Agency Flow

1. View comprehensive analytics dashboard
2. Monitor city-wide live map
3. Manage all incidents in table view
4. Assign volunteers to incidents
5. Update incident status manually
6. View volunteer community list

## 🗺️ Map Status Legend

- **Gray Pin** → Pending
- **Yellow Pin** → Verified
- **Orange Pin** → In Progress
- **Green Pin** → Resolved

## 📊 Data Structure

### Firestore Collections

#### `users`
```typescript
{
  uid: string
  email: string
  role: 'normal' | 'volunteer' | 'agency'
  name: string
  phone: string
  city: string
  // Role-specific fields...
}
```

#### `incidents`
```typescript
{
  id: string
  reportedBy: string
  city: string
  type: string
  severity: 'Low' | 'Medium' | 'High'
  location: { lat: number, lng: number }
  status: 'pending' | 'verified' | 'in-progress' | 'resolved'
  description: string
  timestamp: Date
  updates: Array<IncidentUpdate>
}
```

## 🎨 Design Principles

- **Light Theme Only** - Clean, professional appearance
- **Mobile-First** - Optimized for emergency reporting on mobile
- **Desktop-Optimized Agency View** - Comprehensive control room interface
- **Real-Time Updates** - Live map and incident status changes
- **Minimal Friction** - Fast incident reporting flow

## 🔐 Security Notes

**IMPORTANT**: The current Firebase rules are set for demo purposes only. For production:

1. Implement proper security rules
2. Add field validation
3. Restrict write access based on roles
4. Add rate limiting
5. Implement proper authentication flows

## 🐛 Troubleshooting

### Map not loading
- Check internet connection
- Verify Leaflet CSS is loaded in `index.html`

### Firebase errors
- Verify Firebase config is correct
- Check Firebase console for quota limits
- Ensure Authentication and Firestore are enabled

### Location not working
- Grant browser location permissions
- Use HTTPS in production (required for geolocation)

## 📝 Demo Data

For demo purposes, you can:
- Create multiple user accounts with different roles
- Use mock volunteer data
- Manually create test incidents
- Simulate the complete incident lifecycle

## 🎯 Hackathon Demo Script

1. **Show Registration Flow** (2 min)
   - Register as Normal User
   - Show role selection
   - Complete profile

2. **Report Incident** (1 min)
   - Click emergency button
   - Fill form quickly
   - Show on map

3. **Volunteer Response** (2 min)
   - Login as volunteer
   - Accept incident
   - Add update with photo

4. **Agency Control** (2 min)
   - Show analytics
   - Manage incidents
   - Assign volunteers
   - Show volunteer community

5. **Real-Time Updates** (1 min)
   - Show map auto-updating
   - Status changes reflected live

## 📄 License

This is a hackathon project. Use freely for educational purposes.

## 🤝 Contributing

This is a demo project. Feel free to fork and enhance!

## 📞 Support

For issues or questions, please check:
- Firebase documentation
- React documentation
- Leaflet documentation

---

**Built with ❤️ for crisis response and community safety**
