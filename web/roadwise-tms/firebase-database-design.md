# Firebase Database Design for RoadWise TMS

## 📊 **Database Collections Structure**

### **1. Users Collection**
```javascript
users/{userId}
{
  uid: "string",                    // Firebase Auth UID
  email: "string",                  // User email
  role: "officer" | "user",         // User role
  firstName: "string",
  lastName: "string",
  phoneNumber: "string",
  createdAt: "timestamp",
  lastLogin: "timestamp",
  isActive: "boolean",
  profile: {
    avatar: "string",               // URL to profile image
    department: "string",           // For officers
    badgeNumber: "string",          // For officers
    licensePlate: "string"          // For users (optional)
  },
  preferences: {
    notifications: "boolean",
    language: "string",
    theme: "light" | "dark"
  }
}
```

### **2. Traffic Data Collection**
```javascript
trafficData/{junctionId}
{
  junctionId: "north" | "east" | "south",
  name: "string",                   // "North Junction - Main Street"
  location: {
    latitude: "number",
    longitude: "number",
    address: "string"
  },
  currentStatus: {
    flow: "number",                 // 0-100 percentage
    congestion: "low" | "medium" | "high",
    waitTime: "number",             // minutes
    vehicles: "number",
    cyclists: "number",
    lastUpdated: "timestamp"
  },
  trafficLights: {
    north: {
      status: "red" | "yellow" | "green" | "blue",
      duration: "number",           // seconds
      mode: "auto" | "manual"
    },
    east: {
      status: "red" | "yellow" | "green" | "blue",
      duration: "number",
      mode: "auto" | "manual"
    },
    south: {
      status: "red" | "yellow" | "green" | "blue",
      duration: "number",
      mode: "auto" | "manual"
    }
  },
  sensors: {
    vehicleCount: "number",
    cyclistCount: "number",
    pedestrianCount: "number",
    lastUpdated: "timestamp"
  }
}
```

### **3. Traffic Issues Collection**
```javascript
trafficIssues/{issueId}
{
  issueId: "string",                // Auto-generated
  reporterId: "string",             // Reference to users collection
  issueType: "traffic_jam" | "accident" | "road_construction" | "broken_traffic_light" | "road_damage" | "flooding" | "other",
  location: {
    junctionId: "string",
    address: "string",
    coordinates: {
      latitude: "number",
      longitude: "number"
    }
  },
  description: "string",
  severity: "low" | "medium" | "high",
  status: "reported" | "under_review" | "in_progress" | "resolved" | "closed",
  contactInfo: "string",            // Optional email
  images: ["string"],               // Array of image URLs
  createdAt: "timestamp",
  updatedAt: "timestamp",
  assignedTo: "string",             // Officer ID
  resolution: {
    notes: "string",
    resolvedBy: "string",
    resolvedAt: "timestamp",
    actionTaken: "string"
  }
}
```

### **4. Optimization History Collection**
```javascript
optimizationHistory/{optimizationId}
{
  optimizationId: "string",         // Auto-generated
  performedBy: "string",            // Officer ID
  optimizationType: "auto" | "congestion" | "flow" | "balanced",
  settings: {
    priorityWeight: "number",
    flowWeight: "number",
    waitTimeWeight: "number",
    emergencyMode: "boolean",
    pedestrianPriority: "boolean",
    cyclistPriority: "boolean"
  },
  improvements: {
    north: "number",                // Percentage improvement
    east: "number",
    south: "number"
  },
  trafficSnapshot: {
    north: { /* traffic data structure */ },
    east: { /* traffic data structure */ },
    south: { /* traffic data structure */ }
  },
  createdAt: "timestamp",
  duration: "number",               // Time taken in seconds
  success: "boolean"
}
```

### **5. Traffic Alerts Collection**
```javascript
trafficAlerts/{alertId}
{
  alertId: "string",                // Auto-generated
  type: "traffic_jam" | "construction" | "weather" | "emergency" | "system_update",
  title: "string",
  message: "string",
  severity: "low" | "medium" | "high" | "critical",
  location: {
    junctionId: "string",
    address: "string"
  },
  affectedRoutes: ["string"],       // Array of affected route IDs
  startTime: "timestamp",
  endTime: "timestamp",             // Optional
  isActive: "boolean",
  createdBy: "string",              // Officer ID or system
  createdAt: "timestamp",
  updatedAt: "timestamp",
  recipients: ["string"]            // Array of user IDs to notify
}
```

### **6. Route Planning Collection**
```javascript
routePlans/{planId}
{
  planId: "string",                 // Auto-generated
  userId: "string",                 // Reference to users collection
  startLocation: {
    junctionId: "string",
    address: "string",
    coordinates: {
      latitude: "number",
      longitude: "number"
    }
  },
  endLocation: {
    junctionId: "string",
    address: "string",
    coordinates: {
      latitude: "number",
      longitude: "number"
    }
  },
  travelMode: "car" | "bicycle" | "motorcycle",
  route: {
    waypoints: [
      {
        junctionId: "string",
        estimatedTime: "number",     // minutes
        trafficStatus: "clear" | "moderate" | "congested"
      }
    ],
    totalDistance: "number",        // kilometers
    totalTime: "number",            // minutes
    trafficConditions: "good" | "moderate" | "poor"
  },
  createdAt: "timestamp",
  isActive: "boolean"
}
```

### **7. System Reports Collection**
```javascript
systemReports/{reportId}
{
  reportId: "string",               // Auto-generated
  generatedBy: "string",            // Officer ID
  reportType: "daily" | "weekly" | "monthly" | "custom",
  period: {
    startDate: "timestamp",
    endDate: "timestamp"
  },
  data: {
    totalOptimizations: "number",
    averageImprovement: "number",
    systemEfficiency: "number",
    totalIssues: "number",
    resolvedIssues: "number",
    peakHours: {
      morning: "string",
      evening: "string"
    },
    bottlenecks: ["string"]
  },
  recommendations: ["string"],
  createdAt: "timestamp",
  status: "generating" | "completed" | "failed",
  downloadUrl: "string"             // URL to generated report file
}
```

### **8. Emergency Events Collection**
```javascript
emergencyEvents/{eventId}
{
  eventId: "string",                // Auto-generated
  type: "accident" | "fire" | "medical" | "police" | "weather",
  severity: "low" | "medium" | "high" | "critical",
  location: {
    junctionId: "string",
    address: "string",
    coordinates: {
      latitude: "number",
      longitude: "number"
    }
  },
  description: "string",
  reportedBy: "string",             // User ID or officer ID
  status: "active" | "responding" | "resolved",
  emergencyServices: {
    police: "boolean",
    ambulance: "boolean",
    fire: "boolean"
  },
  trafficImpact: {
    affectedJunctions: ["string"],
    estimatedDuration: "number",    // minutes
    diversionRoutes: ["string"]
  },
  createdAt: "timestamp",
  updatedAt: "timestamp",
  resolvedAt: "timestamp"
}
```

### **9. Analytics Collection**
```javascript
analytics/{date}
{
  date: "string",                   // YYYY-MM-DD format
  trafficFlow: {
    north: {
      average: "number",
      peak: "number",
      low: "number"
    },
    east: {
      average: "number",
      peak: "number",
      low: "number"
    },
    south: {
      average: "number",
      peak: "number",
      low: "number"
    }
  },
  waitTimes: {
    north: {
      average: "number",
      max: "number"
    },
    east: {
      average: "number",
      max: "number"
    },
    south: {
      average: "number",
      max: "number"
    }
  },
  optimizations: {
    total: "number",
    successful: "number",
    averageImprovement: "number"
  },
  issues: {
    total: "number",
    resolved: "number",
    averageResolutionTime: "number"
  },
  systemEfficiency: "number"        // Overall system efficiency percentage
}
```

### **10. Notifications Collection**
```javascript
notifications/{notificationId}
{
  notificationId: "string",         // Auto-generated
  userId: "string",                 // Reference to users collection
  type: "alert" | "issue_update" | "system" | "optimization",
  title: "string",
  message: "string",
  data: {
    // Additional data specific to notification type
    issueId: "string",              // For issue updates
    alertId: "string",              // For alerts
    optimizationId: "string"        // For optimization notifications
  },
  isRead: "boolean",
  priority: "low" | "medium" | "high",
  createdAt: "timestamp",
  expiresAt: "timestamp"            // Optional expiration
}
```

## 🔐 **Security Rules**

### **Users Collection**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Officers can read all user data
    match /users/{userId} {
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'officer';
    }
  }
}
```

### **Traffic Data Collection**
```javascript
match /trafficData/{junctionId} {
  // Everyone can read traffic data
  allow read: if true;
  
  // Only officers can write traffic data
  allow write: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'officer';
}
```

### **Traffic Issues Collection**
```javascript
match /trafficIssues/{issueId} {
  // Users can create and read their own issues
  allow create: if request.auth != null;
  allow read: if request.auth != null && 
    (resource.data.reporterId == request.auth.uid || 
     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'officer');
  
  // Officers can update all issues
  allow update: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'officer';
}
```

## 📈 **Indexes Required**

### **Composite Indexes**
1. `trafficIssues` collection:
   - `status` + `createdAt` (Descending)
   - `severity` + `createdAt` (Descending)
   - `location.junctionId` + `createdAt` (Descending)

2. `trafficAlerts` collection:
   - `isActive` + `severity` + `createdAt` (Descending)
   - `type` + `isActive` + `createdAt` (Descending)

3. `optimizationHistory` collection:
   - `performedBy` + `createdAt` (Descending)
   - `optimizationType` + `createdAt` (Descending)

4. `routePlans` collection:
   - `userId` + `createdAt` (Descending)
   - `travelMode` + `createdAt` (Descending)

## 🔄 **Real-time Features**

### **Live Updates**
- Traffic data updates every 3 seconds
- Real-time traffic light status changes
- Live optimization results
- Instant issue status updates
- Real-time alert notifications

### **Offline Support**
- Traffic data cached locally
- Issue reports queued for sync
- Route plans available offline
- Basic traffic status cached

## 📱 **Mobile Considerations**

### **Data Optimization**
- Minimal data transfer for mobile users
- Compressed images for issue reports
- Efficient query patterns
- Background sync for offline data

### **Push Notifications**
- Traffic alerts
- Issue status updates
- Emergency notifications
- System maintenance alerts

This database design provides a robust foundation for the RoadWise TMS system, supporting all current features and allowing for future scalability and enhancements. 