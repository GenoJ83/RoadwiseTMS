# Firebase Frontend Setup Guide for RoadWise TMS

## 🚀 **Quick Start**

### **1. Create Firebase Project**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project named `roadwise-tms`
3. Enable Authentication (Email/Password)
4. Create Firestore Database
5. Add a web app to your project

### **2. Get Firebase Configuration**
1. In Firebase Console → Project Settings → General
2. Scroll down to "Your apps" section
3. Copy the Firebase config object
4. Create a `.env` file in the project root with your config:

```env
VITE_FIREBASE_API_KEY=your-actual-api-key
VITE_FIREBASE_AUTH_DOMAIN=roadwise-tms.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=roadwise-tms
VITE_FIREBASE_STORAGE_BUCKET=roadwise-tms.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### **3. Configure Firestore Security Rules**
In Firebase Console → Firestore Database → Rules, paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'officer';
    }
    
    // Traffic data - read by all, write by officers only
    match /trafficData/{junctionId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'officer';
    }
    
    // Issues - create by all, read by reporter or officers, update by officers
    match /trafficIssues/{issueId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && 
        (resource.data.reporterId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'officer');
      allow update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'officer';
    }
    
    // Alerts - read by all, write by officers
    match /trafficAlerts/{alertId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'officer';
    }
    
    // Route plans - users can manage their own
    match /routePlans/{planId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Optimization history - read by all, write by officers
    match /optimizationHistory/{optimizationId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'officer';
    }
    
    // Emergency events - read by all, write by officers
    match /emergencyEvents/{eventId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'officer';
    }
  }
}
```

### **4. Create Required Indexes**
In Firebase Console → Firestore Database → Indexes, create:

1. **trafficIssues**: `status` (Ascending), `createdAt` (Descending)
2. **trafficIssues**: `severity` (Ascending), `createdAt` (Descending)
3. **trafficAlerts**: `isActive` (Ascending), `severity` (Ascending), `createdAt` (Descending)
4. **routePlans**: `userId` (Ascending), `createdAt` (Descending)
5. **optimizationHistory**: `performedBy` (Ascending), `createdAt` (Descending)

### **5. Initialize Sample Data**
Run the database initialization script:

```bash
# Update the Firebase config in scripts/initDatabase.js first
node scripts/initDatabase.js
```

## 📁 **Project Structure**

```
src/
├── contexts/
│   └── AuthContext.jsx          # Authentication context
├── services/
│   ├── firebase.js              # Firebase configuration
│   ├── authService.js           # Authentication service
│   └── firebaseService.js       # Database operations
├── components/
│   ├── OfficerLogin.jsx         # Updated with Firebase auth
│   ├── OfficerRegistration.jsx  # Updated with Firebase auth
│   └── ...                      # Other components
└── App.jsx                      # Updated with AuthProvider
```

## 🔧 **Features Implemented**

### **Authentication**
- ✅ User registration (Officers & Users)
- ✅ User login with role-based access
- ✅ Session management
- ✅ Protected routes
- ✅ Loading states
- ✅ Error handling

### **Database Operations**
- ✅ User management
- ✅ Traffic data CRUD
- ✅ Real-time listeners
- ✅ Issue reporting
- ✅ Alert management
- ✅ Route planning
- ✅ Optimization history

### **Security**
- ✅ Role-based access control
- ✅ Firestore security rules
- ✅ Environment variables
- ✅ Input validation

## 🚀 **Testing the Setup**

### **1. Start Development Server**
```bash
npm run dev
```

### **2. Test Authentication**
1. Go to `/register/officer`
2. Create an officer account
3. Login at `/login/officer`
4. Access officer dashboard

### **3. Test Real-time Features**
1. Open browser console
2. Check for Firebase connection warnings
3. Verify authentication state
4. Test protected routes

## 🔍 **Troubleshooting**

### **Firebase Not Configured Warning**
If you see: `⚠️ Firebase not properly configured`
1. Check your `.env` file exists
2. Verify environment variable names start with `VITE_`
3. Restart the development server
4. Check browser console for errors

### **Authentication Errors**
- Ensure Email/Password authentication is enabled in Firebase
- Check Firestore security rules are published
- Verify user role is set correctly during registration

### **Real-time Updates Not Working**
- Check Firestore indexes are created
- Verify security rules allow read access
- Check browser console for permission errors

## 📱 **Next Steps**

### **Backend Integration**
1. Set up Firebase Admin SDK in backend
2. Configure SMS processing
3. Implement Arduino communication
4. Add data processing services

### **Advanced Features**
1. Push notifications
2. Offline support
3. File uploads
4. Analytics dashboard
5. Mobile app development

## 🎯 **Production Deployment**

### **Environment Variables**
```env
VITE_APP_ENV=production
VITE_API_URL=https://your-backend-url.com
```

### **Build and Deploy**
```bash
npm run build
# Deploy to Firebase Hosting, Vercel, or Netlify
```

## 📞 **Support**

If you encounter issues:
1. Check the browser console for errors
2. Verify Firebase project configuration
3. Review security rules and indexes
4. Test with sample data first

Your RoadWise TMS frontend is now ready with Firebase integration! 🎉 