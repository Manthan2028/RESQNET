# ResQNet - Project Structure

## 📁 Directory Structure

```
RESQNET PROJECT/
├── src/
│   ├── components/
│   │   ├── AgencyDashboard.tsx      # Agency control room interface
│   │   ├── Login.tsx                # Login page
│   │   ├── Registration.tsx         # Multi-step registration
│   │   ├── NormalUserDashboard.tsx  # Normal user interface
│   │   ├── VolunteerDashboard.tsx   # Volunteer interface
│   │   └── LiveMap.tsx              # Shared map component
│   ├── contexts/
│   │   └── AuthContext.tsx          # Authentication state management
│   ├── config/
│   │   └── firebase.ts              # Firebase configuration
│   ├── types/
│   │   └── index.ts                 # TypeScript type definitions
│   ├── App.tsx                      # Main app with routing
│   ├── main.tsx                     # React entry point
│   ├── index.css                    # Global styles (Tailwind)
│   └── vite-env.d.ts               # Vite type definitions
├── public/                          # Static assets
├── index.html                       # HTML entry point
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── vite.config.ts                   # Vite config
├── tailwind.config.js               # Tailwind config
├── postcss.config.js                # PostCSS config
├── firestore.rules                  # Firestore security rules
├── storage.rules                    # Storage security rules
├── .env.example                     # Environment template
├── .gitignore                       # Git ignore rules
├── README.md                        # Main documentation
├── SETUP.md                         # Quick setup guide
└── PROJECT_STRUCTURE.md             # This file
```

## 🎯 Component Architecture

### Authentication Flow
```
App.tsx
  └── AuthProvider (AuthContext.tsx)
      ├── Login.tsx
      ├── Registration.tsx
      └── Protected Routes
          ├── NormalUserDashboard.tsx
          ├── VolunteerDashboard.tsx
          └── AgencyDashboard.tsx
```

### Data Flow
```
Firebase Firestore
  ├── users collection
  │   └── User documents (role-based profiles)
  ├── incidents collection
  │   └── Incident documents (with updates array)
  └── Real-time listeners in components
```

### Map Integration
```
LiveMap.tsx (Shared Component)
  ├── Used by NormalUserDashboard
  ├── Used by VolunteerDashboard
  └── Used by AgencyDashboard
  
Features:
  - Real-time Firestore listeners
  - Color-coded incident markers
  - Auto-updating on status changes
  - Interactive popups
  - City-based filtering
```

## 🔄 User Journey Flows

### Normal User Journey
```
1. Registration → Role: Normal User
2. Dashboard loads
3. Click "REPORT EMERGENCY"
4. Fill form (auto-capture GPS)
5. Submit → Incident created in Firestore
6. View on map (gray pin - pending)
7. Track status updates in real-time
```

### Volunteer Journey
```
1. Registration → Role: Volunteer
2. Dashboard loads with city incidents
3. View available incidents
4. Accept incident → Status: verified (yellow pin)
5. Add on-ground update with photo
6. Update status → in-progress (orange pin)
7. Mark as resolved (green pin)
```

### Agency Journey
```
1. Registration → Role: Agency
2. Control room dashboard loads
3. View analytics (total, active, resolved)
4. Monitor city-wide map
5. Manage incidents in table
6. Assign volunteers
7. Update status manually
8. View volunteer community
```

## 🗄️ Data Models

### User Model
```typescript
{
  uid: string
  email: string
  role: 'normal' | 'volunteer' | 'agency'
  name: string
  phone: string
  city: string
  createdAt: Date
  
  // Volunteer-specific
  volunteerCategory?: 'Medical' | 'Rescue' | 'Transport' | 'NGO' | 'General'
  idProofUrl?: string
  isAvailable?: boolean
  
  // Agency-specific
  authorityName?: string
  department?: string
  region?: string
}
```

### Incident Model
```typescript
{
  id: string
  reportedBy: string
  reportedByName: string
  reportedByRole: 'normal' | 'volunteer' | 'agency'
  city: string
  type: 'accident' | 'fire' | 'medical' | 'flood' | 'earthquake' | 'other'
  severity: 'Low' | 'Medium' | 'High'
  location: {
    lat: number
    lng: number
    address?: string
  }
  status: 'pending' | 'verified' | 'in-progress' | 'resolved'
  description: string
  imageUrl?: string
  videoUrl?: string
  timestamp: Date
  updates: IncidentUpdate[]
  assignedVolunteer?: string
  assignedVolunteerName?: string
}
```

### Incident Update Model
```typescript
{
  id: string
  timestamp: Date
  updatedBy: string
  updatedByRole: 'normal' | 'volunteer' | 'agency'
  message: string
  imageUrl?: string
  status: 'pending' | 'verified' | 'in-progress' | 'resolved'
}
```

## 🎨 Styling Architecture

### Tailwind Configuration
- **Primary Color**: Blue (crisis/emergency theme)
- **Danger Color**: Red (emergency alerts)
- **Success Color**: Green (resolved incidents)
- **Warning Color**: Yellow/Orange (in-progress)

### Custom CSS Classes
- `.btn-primary` - Primary action buttons
- `.btn-secondary` - Secondary actions
- `.btn-danger` - Emergency/critical actions
- `.btn-success` - Success/completion actions
- `.card` - Container cards
- `.input-field` - Form inputs
- `.label` - Form labels

## 🔐 Security Considerations

### Current Setup (Demo)
- Test mode Firestore rules
- Basic authentication checks
- Client-side role validation

### Production Requirements
- Implement proper security rules
- Server-side role verification
- Rate limiting
- Input validation
- XSS protection
- CSRF protection

## 📊 State Management

### Context API
- **AuthContext**: User authentication and profile
  - currentUser (Firebase Auth)
  - userProfile (Firestore document)
  - loading state
  - register/login/logout functions

### Real-time Listeners
- Incidents collection (filtered by city)
- Users/Volunteers collection
- Auto-updates on Firestore changes

## 🚀 Performance Optimizations

### Current Optimizations
- Firestore query filtering by city
- Real-time listeners with cleanup
- Lazy loading of images
- Efficient re-renders with React hooks

### Future Optimizations
- Pagination for large incident lists
- Virtual scrolling
- Image compression
- Service worker for offline support
- CDN for static assets

## 🧪 Testing Strategy

### Manual Testing Checklist
- [ ] Registration flow (all roles)
- [ ] Login/logout
- [ ] Session persistence
- [ ] Incident reporting
- [ ] GPS location capture
- [ ] Image upload
- [ ] Map rendering
- [ ] Real-time updates
- [ ] Volunteer assignment
- [ ] Status updates
- [ ] Role-based access

### Demo Scenarios
1. Multi-device demo (3 devices, 3 roles)
2. Real-time update demo
3. Map visualization demo
4. Volunteer community demo

## 📱 Responsive Design

### Breakpoints
- Mobile: < 768px (Normal User optimized)
- Tablet: 768px - 1024px
- Desktop: > 1024px (Agency optimized)

### Mobile-First Components
- NormalUserDashboard (emergency reporting)
- VolunteerDashboard (field updates)

### Desktop-First Components
- AgencyDashboard (control room)

## 🔧 Development Workflow

1. **Setup**: `npm install`
2. **Development**: `npm run dev`
3. **Build**: `npm run build`
4. **Preview**: `npm run preview`

## 📦 Deployment Options

### Recommended Platforms
- **Vercel** (Easiest for Vite + React)
- **Netlify** (Good for static sites)
- **Firebase Hosting** (Integrated with Firebase)
- **GitHub Pages** (Free hosting)

### Deployment Steps (Vercel)
1. Push code to GitHub
2. Import project in Vercel
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Deploy!

## 🎯 Hackathon Judging Points

### Technical Excellence
✅ Real-time data synchronization
✅ Role-based access control
✅ GPS integration
✅ File upload handling
✅ Responsive design

### User Experience
✅ Intuitive registration flow
✅ One-time setup
✅ Fast emergency reporting
✅ Live visual feedback
✅ Mobile-optimized

### Innovation
✅ Community-driven response
✅ City-wide coordination
✅ Volunteer management
✅ Real-time map visualization

### Scalability
✅ Firebase infrastructure
✅ Modular architecture
✅ Type-safe codebase
✅ Production-ready structure

---

**This structure is designed for rapid development and easy demonstration while maintaining code quality and scalability.**
