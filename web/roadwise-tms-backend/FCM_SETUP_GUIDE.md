# FCM Setup Guide for RoadWise TMS Backend

## Overview
The backend now uses Firebase Cloud Messaging (FCM) instead of Twilio for sending notifications to devices. FCM is free, reliable, and integrates seamlessly with your existing Firebase setup.

## Features Added

### 1. SMS Receiving (Still exists)
- Webhook endpoint: `POST /api/sms`
- Parses traffic data from SIM800L modules
- Stores data in Firebase Firestore
- Creates alert logs

### 2. FCM Notifications (Replaces SMS sending)
- Send notifications to specific devices: `POST /api/sms/send`
- Send traffic commands to devices: `POST /api/sms/send` with type='traffic'
- Send emergency alerts: `POST /api/sms/send` with type='emergency'
- Send to topics: `POST /api/sms/send` with type='topic'
- Notification history: `GET /api/sms/history`

### 3. Emergency Alerts (Enhanced)
- Automatic detection of emergency conditions
- Configurable thresholds for vehicles, congestion, and cyclists
- Sends FCM notifications to registered devices

## Advantages of FCM over Twilio

### ✅ **Cost Benefits**
- **FCM**: Completely free for unlimited messages
- **Twilio**: $0.0075 per SMS (can add up quickly)

### ✅ **Technical Benefits**
- **FCM**: Real-time, instant delivery
- **FCM**: Rich notifications with images, actions, and data
- **FCM**: Topic-based messaging for broadcasting
- **FCM**: Automatic retry and delivery confirmation
- **FCM**: Works on web, iOS, and Android

### ✅ **Integration Benefits**
- **FCM**: Already integrated with your Firebase project
- **FCM**: No additional service setup required
- **FCM**: Unified backend for data and notifications

## Setup Instructions

### 1. Environment File
Your existing `.env` file already has the Firebase configuration needed for FCM:

```env
# Server Configuration
PORT=3001

# Firebase Configuration (your actual credentials)
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=roadwise-tms
FIREBASE_PRIVATE_KEY_ID=3022e181b787f6627bc777af4eb6680236288e08
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCzrWZdLEMLaP4d\nX2ol/To1ZUN3sOesQo6xqWEvGpjvsOJtmpEG6LxbE1/MBfa2iCB1f6APZ9JNCCZz\n6F+QPRUYDYleQjYeHUFkdS/b7sUgNoI52lv+Ug/WbTE9eQhdnJ4BD7+9/ifZOzm4\nx+pivrDVMVksYeTc/CjNqzWY3NDj1Q/r42lD8iAxMpUNqg6E7FAHp7+Ne2dVBiTf\n030SxXeUKMs9/5MVXRziQ4xfWGJRduHOp0jdK7rcPwdKkRJ7Ca3EdEb3fiQZCjXa\nGvKRGN2Y2ZI6R907tjfGp6ChEeOk+4Gw9KyghGAMAPirvz2ppBXpjiMgRwtCWA3l\n6/GSyNcBAgMBAAECggEADthdDIYvbOYqFrWvML/VGxvIgP9gCNK/9OxUb/6f06/2\n6UzbviklBNZbNCFrAqZJHkQi7prqnHw3pxx0JtfxIfleV+gbDg5nPHxVLbPy3Ag8\n5rhEoQTZM6N2bciN+SQLRvWs5y70TmWvDXYRBsMQG7E1162n6d04ptOGPGDELoqk\nzlN5rqLh6p9d/aoeEjyFAaFs8pp8adSGQ8RNuZs/NgCUAoWULUqbZ9RgDbnpXUNg\nv7TeIH92DLTjOUQ9A2rLgBm709i/76gBWM74kcEfwn5O99hK4qMelwHH8vvlkPqN\n49ntNJd/AaKc3dC8YxmNCiachgVD1K/n+UwAFLVzxQKBgQDdnTCXK9xjgs/LUWjw\nyihA5p/m5V8/+SQaeIOx3d2X1q5xIJNRUc6UsCwOJb8Uccni10CLHTyK8e1gJ4Zz\n3sOZGOZtvpHNguZuJxYxvpKhRJDxUeIXJtN+HYUlOCyjkyd4qhtwJA07OTODL1jC\nd7cb4zVNXDgwwff8gNRyAuBR5QKBgQDPjm2a2yDbVD+Pc5sukUllXor7D+OPlKrH\nmPBW3vSHkPOn2PWyfkTT5CPovPaRcBx6QJgqrGR1axKNL4ZVZIeo22N9l+DA5WeQ\nrRsG7OWALghI3lChJhU4Meq1JcqSNa7heJvXv0WaeB4CWt0FnCOlutwwf5jmuaRF\nZDHZkfCO7QKBgQDBCk6sL/Ge4PCeW4C81mtv9TRuTXjF4gCX6khVJD0FKWT0d/q7\nSDZZgIgvnqOubFv+c5/uTf5RzeEG9AcDYZUiA/WcvPaGfLK6WuPTWvyg63gSLVBy\n+EgbwB0dyavgpKsqSYrzCQRZhT8g05pOczeWXDku9NihaCTa12G3GlhKHQKBgQDJ\n/R8XfDdum3+7uFMGL6gQ+cAhcqYQHitRUbpboGCy6dLlvxPlIFMVLsnvfq4qfcOJ\nCgHMTbb6Ojh0pBKEWfBX2SHqoPq+XsK6HmzWAYebhbDUUV6AZZJy/Mkgf2WzgoDt\ntjVb8i3nlQwHWKwOAJUEfWQ54oNHztRaH5cP2KIWRQKBgB9nr6NW+7Bhd3byDoUc\nKvJfMXrKQRH1xqopWfr6h6NsslENwATdqjGdfXCrprHWFvPkvZxLTp0NrXl+BV9r\n7C1vpy/B2AflGRlyQtxMdmKXYLPqsWub8rDzNtqsGVGfnVIcOwjr/Pc7lWE7x7I2\nDid7qCytc4NgnMNSA6S+/BEi\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@roadwise-tms.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=110449312275974204859
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40roadwise-tms.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://roadwise-tms.firebaseio.com
```

### 2. Install Dependencies
```bash
cd web/roadwise-tms-backend
npm install
```

### 3. Start the Server
```bash
npm start
# or
node server.js
```

## API Endpoints

### SMS Receiving (from SIM800L)
```http
POST /api/sms
Content-Type: application/json

{
  "Body": "N:1,0,0.3,12.345678,98.765432",
  "From": "+1234567890"
}
```

### FCM Notifications

#### General Notification
```http
POST /api/sms/send
Content-Type: application/json

{
  "tokens": ["device_token_1", "device_token_2"],
  "notification": {
    "title": "Traffic Alert",
    "body": "High congestion detected on North junction"
  },
  "data": {
    "congestion": "0.8",
    "location": "North"
  },
  "type": "general"
}
```

#### Traffic Command to Devices
```http
POST /api/sms/send
Content-Type: application/json

{
  "tokens": ["arduino_device_token"],
  "notification": {
    "title": "Traffic Light Command",
    "body": "N junction set to RED"
  },
  "type": "traffic",
  "data": {
    "direction": "N",
    "state": "RED"
  }
}
```

#### Emergency Alert
```http
POST /api/sms/send
Content-Type: application/json

{
  "tokens": ["emergency_device_1", "emergency_device_2"],
  "notification": {
    "title": "🚨 Emergency Alert",
    "body": "Emergency situation detected"
  },
  "type": "emergency",
  "data": {
    "message": "High vehicle count detected",
    "location": {
      "latitude": "12.345678",
      "longitude": "98.765432"
    }
  }
}
```

#### Topic-based Broadcasting
```http
POST /api/sms/send
Content-Type: application/json

{
  "notification": {
    "title": "System Update",
    "body": "Traffic management system updated"
  },
  "type": "topic",
  "data": {
    "topic": "traffic_updates",
    "version": "2.0"
  }
}
```

### Traffic Commands (Enhanced)
```http
POST /api/command/traffic
Content-Type: application/json

{
  "command": "N:RED",
  "direction": "N",
  "state": "RED",
  "deviceTokens": ["arduino_device_token"]
}
```

### Notification History
```http
GET /api/sms/history?limit=50&type=outgoing
```

## Device Token Management

### Frontend Integration
Your frontend needs to:
1. Request notification permission
2. Get FCM token from Firebase
3. Send token to backend for registration

### Example Frontend Code
```javascript
// Request permission and get token
const permission = await Notification.requestPermission();
if (permission === 'granted') {
  const token = await getToken(messaging, {
    vapidKey: 'your-vapid-key'
  });
  
  // Send token to backend
  await fetch('/api/devices/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, userId: 'user123' })
  });
}
```

## Emergency Thresholds
The system automatically detects emergency conditions based on:
- **Vehicles**: > 50 vehicles
- **Congestion**: > 0.8 (80% congestion)
- **Cyclists**: > 10 cyclists

When emergency conditions are detected, the system:
1. Sends FCM notifications to registered devices
2. Logs the emergency in Firebase
3. Continues normal operation

## Testing
1. Test SMS receiving by sending a POST request to `/api/sms`
2. Test FCM sending by sending a POST request to `/api/sms/send`
3. Monitor logs for successful FCM delivery
4. Check Firebase for stored data and logs

## Troubleshooting
1. **FCM not sending**: Check Firebase configuration and device tokens
2. **Webhook not receiving**: Ensure proper URL configuration
3. **Firebase errors**: Check Firebase configuration and permissions
4. **Emergency alerts not working**: Verify device token registration

## Security Notes
- FCM tokens are sensitive - store them securely
- Use HTTPS in production
- Validate device tokens before sending notifications
- Implement rate limiting for FCM sending
- Monitor FCM usage (though it's free for most use cases)

## Migration from Twilio
If you were previously using Twilio:
1. ✅ Remove Twilio dependency (already done)
2. ✅ Update API endpoints (already done)
3. ✅ Replace phone numbers with device tokens
4. ✅ Update frontend to handle FCM tokens
5. ✅ Test all notification flows

Your system is now using FCM for all notifications! 🚀 