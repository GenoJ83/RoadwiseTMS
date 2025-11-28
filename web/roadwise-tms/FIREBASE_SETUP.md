# Firebase Setup Guide for RoadWise TMS

## 🚀 **Step 1: Create Firebase Project**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `roadwise-tms`
4. Enable Google Analytics (optional)
5. Choose analytics account or create new one
6. Click "Create project"

## 🔧 **Step 2: Enable Authentication**

1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable the following providers:
   - **Email/Password** (for user registration)
   - **Google** (optional, for easier sign-in)
5. Configure each provider as needed

## 📊 **Step 3: Create Firestore Database**

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in production mode"
4. Select a location (choose closest to your users)
5. Click "Done"

## 🔐 **Step 4: Configure Security Rules**

1. In Firestore Database, go to "Rules" tab
2. Replace the default rules with our custom rules:

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

3. Click "Publish"

## 📱 **Step 5: Add Web App**

1. In Firebase Console, click the gear icon → "Project settings"
2. Scroll down to "Your apps" section
3. Click the web icon (</>)
4. Enter app nickname: `roadwise-tms-web`
5. Check "Also set up Firebase Hosting" (optional)
6. Click "Register app"
7. Copy the Firebase config object

## ⚙️ **Step 6: Update Firebase Config**

1. Open `src/services/firebase.js`
2. Replace the placeholder config with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "roadwise-tms.firebaseapp.com",
  projectId: "roadwise-tms",
  storageBucket: "roadwise-tms.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

## 📦 **Step 7: Install Firebase Dependencies**

```bash
npm install firebase
```

## 🗂️ **Step 8: Create Required Indexes**

1. In Firestore Database, go to "Indexes" tab
2. Click "Create index"
3. Create the following composite indexes:

### **trafficIssues Collection**
- Collection ID: `trafficIssues`
- Fields: `status` (Ascending), `createdAt` (Descending)
- Query scope: Collection

- Collection ID: `trafficIssues`
- Fields: `severity` (Ascending), `createdAt` (Descending)
- Query scope: Collection

### **trafficAlerts Collection**
- Collection ID: `trafficAlerts`
- Fields: `isActive` (Ascending), `severity` (Ascending), `createdAt` (Descending)
- Query scope: Collection

### **routePlans Collection**
- Collection ID: `routePlans`
- Fields: `userId` (Ascending), `createdAt` (Descending)
- Query scope: Collection

### **optimizationHistory Collection**
- Collection ID: `optimizationHistory`
- Fields: `performedBy` (Ascending), `createdAt` (Descending)
- Query scope: Collection

## 🗄️ **Step 9: Initialize Database with Sample Data**

Create a script to initialize the database with sample traffic data:

```javascript
// scripts/initDatabase.js
import { db, collections, JUNCTIONS } from '../src/services/firebase.js';
import { doc, setDoc } from 'firebase/firestore';

const initializeTrafficData = async () => {
  const sampleData = {
    north: {
      junctionId: 'north',
      name: 'North Junction - Main Street',
      currentStatus: {
        flow: 75,
        congestion: 'medium',
        waitTime: 2,
        vehicles: 45,
        cyclists: 8
      },
      trafficLights: {
        north: { status: 'green', duration: 30, mode: 'auto' },
        east: { status: 'red', duration: 30, mode: 'auto' },
        south: { status: 'red', duration: 30, mode: 'auto' }
      },
      sensors: {
        vehicleCount: 45,
        cyclistCount: 8,
        lastUpdated: new Date()
      }
    },
    east: {
      junctionId: 'east',
      name: 'East Junction - Highway',
      currentStatus: {
        flow: 60,
        congestion: 'low',
        waitTime: 1,
        vehicles: 30,
        cyclists: 5
      },
      trafficLights: {
        north: { status: 'red', duration: 30, mode: 'auto' },
        east: { status: 'green', duration: 30, mode: 'auto' },
        south: { status: 'red', duration: 30, mode: 'auto' }
      },
      sensors: {
        vehicleCount: 30,
        cyclistCount: 5,
        lastUpdated: new Date()
      }
    },
    south: {
      junctionId: 'south',
      name: 'South Junction - Downtown',
      currentStatus: {
        flow: 90,
        congestion: 'high',
        waitTime: 5,
        vehicles: 60,
        cyclists: 12
      },
      trafficLights: {
        north: { status: 'red', duration: 30, mode: 'auto' },
        east: { status: 'red', duration: 30, mode: 'auto' },
        south: { status: 'green', duration: 30, mode: 'auto' }
      },
      sensors: {
        vehicleCount: 60,
        cyclistCount: 12,
        lastUpdated: new Date()
      }
    }
  };

  for (const [junctionId, data] of Object.entries(sampleData)) {
    await setDoc(doc(db, collections.TRAFFIC_DATA, junctionId), data);
  }
  
  console.log('Database initialized with sample traffic data');
};

// Run the initialization
initializeTrafficData().catch(console.error);
```

## 🔄 **Step 10: Test Real-time Features**

1. Start your development server
2. Open the application
3. Test real-time traffic data updates
4. Verify authentication works
5. Test creating and updating issues
6. Check that security rules are working correctly

## 📊 **Step 11: Monitor Usage**

1. In Firebase Console, go to "Usage and billing"
2. Set up billing alerts
3. Monitor Firestore read/write operations
4. Check authentication usage

## 🚨 **Step 12: Production Considerations**

1. **Environment Variables**: Store Firebase config in environment variables
2. **Error Handling**: Implement proper error handling for all Firebase operations
3. **Offline Support**: Configure Firestore for offline persistence
4. **Performance**: Use pagination for large datasets
5. **Security**: Regularly review and update security rules
6. **Backup**: Set up automated backups for critical data

## 🔧 **Environment Variables Setup**

Create a `.env` file in your project root:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=roadwise-tms.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=roadwise-tms
VITE_FIREBASE_STORAGE_BUCKET=roadwise-tms.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

Update `src/services/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

## ✅ **Verification Checklist**

- [ ] Firebase project created
- [ ] Authentication enabled
- [ ] Firestore database created
- [ ] Security rules configured
- [ ] Web app registered
- [ ] Firebase config updated
- [ ] Dependencies installed
- [ ] Indexes created
- [ ] Sample data initialized
- [ ] Real-time features tested
- [ ] Environment variables set
- [ ] Error handling implemented

Your Firebase database is now ready for the RoadWise TMS application! 🎉 