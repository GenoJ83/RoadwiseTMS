# Infobip SMS Setup Guide

## Overview
This system uses **Infobip** for SMS communication with Arduino GSM modules.

## Communication Flow
```
SIM800L (Arduino) → SMS → Backend → SMS → Arduino (Traffic Control)
                                    ↓
                              SMS → Emergency Contacts
```

## Complete `.env` File
```env
# Server Configuration
PORT=3001

# Firebase Configuration
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

# Infobip Configuration
INFOBIP_API_KEY=335673a3ed72b450da7efa28c43bb50f-01bb1a8e-1c35-4030-9d89-6529a8c1b441
INFOBIP_BASE_URL=rpzr1p.api.infobip.com
INFOBIP_FROM_NUMBER=447491163443

# Emergency Contacts (comma-separated phone numbers)
EMERGENCY_CONTACTS=256781642869,+1987654321

# Arduino Phone Numbers (comma-separated)
ARDUINO_PHONES=256781642869,+1987654321
```

## API Usage

### Traffic Command (SMS to Arduino)
```http
POST /api/command/traffic
Content-Type: application/json

{
  "command": "N:RED",
  "direction": "N",
  "state": "RED",
  "arduinoPhone": "256781642869"
}
```

### Send SMS
```http
POST /api/sms/send
Content-Type: application/json

{
  "to": "256781642869",
  "message": "Hello from RoadWise TMS",
  "type": "general"
}
```

### Traffic Command via SMS
```http
POST /api/sms/send
Content-Type: application/json

{
  "to": "256781642869",
  "message": "Traffic light command",
  "type": "traffic",
  "direction": "N",
  "state": "RED"
}
```

### Emergency Alert
```http
POST /api/sms/send
Content-Type: application/json

{
  "to": "256781642869",
  "message": "Emergency situation detected",
  "type": "emergency",
  "phoneNumbers": ["256781642869", "+1987654321"]
}
```

## Benefits
- ✅ **Simple**: Direct SMS communication
- ✅ **Reliable**: Infobip is a trusted SMS provider
- ✅ **Cost Effective**: Competitive SMS pricing
- ✅ **Global**: Works worldwide 