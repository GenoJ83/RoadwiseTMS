# Firebase Automatic Sync - RoadWise TMS

## Overview

The RoadWise TMS system now includes automatic synchronization with Firebase Firestore database. All traffic data, sensor readings, traffic light states, and system events are automatically sent to Firebase in real-time.

## Features

### 🔄 Automatic Data Synchronization
- **Sensor Data**: Updates every 5 seconds
- **Traffic Lights**: Updates every 2 seconds  
- **System Mode**: Updates every 10 seconds
- **Event Logging**: Logs every 30 seconds

### 📊 Data Types Synced

#### 1. Traffic Sensor Data
```javascript
{
  vehicles: number,        // Number of vehicles detected
  cyclists: number,        // Number of cyclists detected
  congestion: 'low'|'medium'|'high',  // Congestion level
  lastUpdated: timestamp,
  isActive: boolean
}
```

#### 2. Traffic Light States
```javascript
{
  trafficLight: {
    red: boolean,
    orange: boolean,
    blue: boolean,
    green: boolean
  },
  lastUpdated: timestamp,
  isActive: boolean
}
```

#### 3. System Mode Data
```javascript
{
  currentPhase: 'north'|'east'|'south',
  nextPhase: 'north'|'east'|'south',
  phaseTimer: number,
  isAutomaticMode: boolean,
  cyclistPriority: string|null,
  cyclistTimer: number,
  priorityMode: boolean,
  priorityDirection: string|null,
  lastUpdated: timestamp
}
```

#### 4. Event Logs
```javascript
{
  type: 'system_status'|'phase_change'|'mode_switch'|'priority_activation',
  data: object,
  timestamp: timestamp,
  eventId: string
}
```

## Firebase Collections

### 1. `trafficData` Collection
- **Document IDs**: `north`, `east`, `south`, `system`
- **Purpose**: Stores real-time traffic data for each junction

### 2. `analytics` Collection
- **Purpose**: Stores system events and analytics data
- **Auto-generated IDs**: Each event gets a unique ID

### 3. `users` Collection
- **Purpose**: Stores user accounts and authentication data

### 4. `trafficIssues` Collection
- **Purpose**: Stores user-reported traffic issues

### 5. `trafficAlerts` Collection
- **Purpose**: Stores system alerts and notifications

## Configuration

### Auto-Sync Settings
```javascript
export const autoSyncConfig = {
  SENSOR_DATA_SYNC_INTERVAL: 5000,    // 5 seconds
  TRAFFIC_LIGHT_SYNC_INTERVAL: 2000,  // 2 seconds
  SYSTEM_MODE_SYNC_INTERVAL: 10000,   // 10 seconds
  EVENT_LOG_INTERVAL: 30000,          // 30 seconds
  
  ENABLE_AUTO_SYNC: true,
  ENABLE_EVENT_LOGGING: true,
  
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
};
```

## Usage

### 1. Automatic Sync (Default)
The system automatically starts syncing when the TrafficDataContext is initialized:

```javascript
// Automatically starts when component mounts
const { isFirebaseReady, syncStatus, lastSyncTime } = useTrafficData();
```

### 2. Manual Sync
You can manually trigger a sync:

```javascript
const { manualSync } = useTrafficData();

// Trigger manual sync
await manualSync();
```

### 3. Control Auto-Sync
```javascript
const { startAutoSync, stopAutoSync } = useTrafficData();

// Start automatic sync
startAutoSync();

// Stop automatic sync
stopAutoSync();
```

## Status Monitoring

### Sync Status Types
- `initializing`: System is setting up Firebase connection
- `ready`: Firebase is ready for sync
- `syncing`: Currently syncing data
- `synced`: Data successfully synced
- `error`: Sync error occurred

### FirebaseSyncStatus Component
```javascript
import FirebaseSyncStatus from './FirebaseSyncStatus';

// Full status display
<FirebaseSyncStatus />

// Compact status display
<FirebaseSyncStatus compact={true} />
```

## Error Handling

### Automatic Retry
- Failed syncs are automatically retried up to 3 times
- 1-second delay between retry attempts
- Errors are logged to console and displayed in UI

### Error Types
- **Connection Errors**: Firebase not available
- **Permission Errors**: Insufficient database permissions
- **Data Errors**: Invalid data format
- **Network Errors**: Connection timeout

## Database Rules

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Traffic data - read/write for authenticated users
    match /trafficData/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Analytics - read for officers, write for system
    match /analytics/{document} {
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'officer';
      allow write: if request.auth != null;
    }
    
    // Users - read own data, write for admins
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Performance Considerations

### Optimization Features
- **Batch Updates**: Multiple junction updates are batched
- **Conditional Updates**: Only changed data is sent
- **Connection Pooling**: Reuses Firebase connections
- **Error Recovery**: Graceful handling of network issues

### Monitoring
- Real-time sync status in UI
- Console logging for debugging
- Error tracking and reporting
- Performance metrics collection

## Testing

### Manual Testing
1. Open browser console
2. Check for Firebase initialization messages
3. Monitor sync status in dashboard
4. Verify data appears in Firebase console

### Automated Testing
```javascript
// Test Firebase connection
const { isFirebaseReady } = useTrafficData();
console.log('Firebase ready:', isFirebaseReady);

// Test manual sync
const { manualSync } = useTrafficData();
await manualSync();
```

## Troubleshooting

### Common Issues

#### 1. Firebase Not Initializing
- Check Firebase configuration in `src/services/firebase.js`
- Verify API keys and project settings
- Check network connectivity

#### 2. Sync Errors
- Check Firebase console for error details
- Verify database rules allow write access
- Check authentication status

#### 3. Performance Issues
- Reduce sync intervals in `autoSyncConfig`
- Check network bandwidth
- Monitor Firebase usage quotas

### Debug Mode
Enable detailed logging by setting:
```javascript
localStorage.setItem('debug', 'firebase-sync');
```

## Future Enhancements

### Planned Features
- **Offline Support**: Queue syncs when offline
- **Data Compression**: Reduce bandwidth usage
- **Real-time Subscriptions**: Live updates from Firebase
- **Advanced Analytics**: Machine learning insights
- **Multi-junction Support**: Scale to multiple intersections

### Integration Possibilities
- **IoT Sensors**: Direct sensor integration
- **Mobile Apps**: Real-time mobile notifications
- **Emergency Services**: Direct emergency system integration
- **Weather APIs**: Weather-based traffic optimization

## Support

For technical support or questions about Firebase sync:
- Check the browser console for error messages
- Review Firebase console for data flow
- Contact the development team with specific error details

---

**Last Updated**: June 2024
**Version**: 1.0.0
**Firebase Project**: roadwise-tms 