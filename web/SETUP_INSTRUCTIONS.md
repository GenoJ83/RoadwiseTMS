# RoadWise TMS - Complete Setup Guide

## 🚀 Quick Start

The RoadWise TMS (Traffic Management System) is fully set up and ready to run! Here's how to get everything working:

## 📁 Project Structure

```
web/
├── roadwise-tms/          # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components  
│   │   └── services/      # API and Firebase services
│   └── package.json
└── roadwise-tms-backend/  # Backend (Node.js + Express)
    ├── config/            # Firebase configuration
    ├── routes/            # API routes
    └── server.js          # Main server file
```

## 🛠️ Setup Instructions

### 1. Frontend Setup

```bash
cd web/roadwise-tms
npm install
npm run dev
```

**Frontend will be available at:** `http://localhost:5173`

### 2. Backend Setup

```bash
cd web/roadwise-tms-backend
npm install
npm start
```

**Backend will be available at:** `http://localhost:3001`

## 🔐 Login Credentials

### Traffic Officer Access
- **Email:** `officer@roadwise.com`
- **Password:** `traffic123`
- **Dashboard:** `/dashboard/officer`

### Road User Access  
- **Email:** `user@roadwise.com`
- **Password:** `road123`
- **Dashboard:** `/dashboard/user`

## 🎯 Features Implemented

### ✅ Frontend Features
- **Landing Page**: Welcome screen with login button
- **Login System**: Role-based authentication (officer/user)
- **Traffic Officer Dashboard**: 
  - Traffic light control (Red/Yellow/Green/Blue)
  - Real-time status display
  - Alert log with GPS coordinates
- **Road User Scheduler**:
  - Travel time prediction form
  - Custom algorithm for recommendations
  - Historical data analysis

### ✅ Backend Features
- **Express Server**: RESTful API endpoints
- **SMS Processing**: Twilio webhook for SIM800L integration
- **Command Handling**: Traffic light control commands
- **Firebase Integration**: Real-time database updates
- **Travel Recommendations**: AI-powered prediction algorithm

### ✅ Integration Features
- **Real-time Communication**: Frontend ↔ Backend ↔ Arduino
- **SMS Format**: `N:1,0,0.3,12.345678,98.765432`
- **API Endpoints**: `/api/sms`, `/api/command/traffic`, `/api/command/recommendation`
- **Error Handling**: Graceful fallbacks and error recovery

## 🔧 Configuration Required

### Firebase Setup
1. Create Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Create Firestore database
4. Update `src/services/firebase.js` with your config

### Environment Variables (Backend)
Copy `env.example` to `.env` and update:
```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
```

## 📱 Arduino Integration

### Expected SMS Format
```
N:1,0,0.3,12.345678,98.765432
```
- `N` = Direction (N/E/S)
- `1` = Vehicle count
- `0` = Cyclist count  
- `0.3` = Congestion level (0.0-1.0)
- `12.345678` = Latitude
- `98.765432` = Longitude

### Hardware Requirements
- Arduino Uno
- 74HC595 shift register
- Ultrasonic sensors (vehicle detection)
- PIR sensors (cyclist detection)
- SIM800L GSM module
- NEO-6M GPS module

## 🧪 Testing the System

### 1. Testing Frontend
1. Open `http://localhost:5173`
2. Click "Login"
3. Use test credentials above
4. Navigate through dashboards

### 2. Testing Backend
1. Check health: `http://localhost:3001/health`
2. Test traffic command: `POST /api/command/traffic`
3. Test recommendation: `POST /api/command/recommendation`

### 3. Testing Integration
Send test SMS to Twilio webhook:
```json
{
  "Body": "N:1,0,0.3,12.345678,98.765432",
  "From": "+1234567890"
}
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd web/roadwise-tms
npm run build
# Deploy dist/ folder
```

### Backend (Heroku/Railway)
```bash
cd web/roadwise-tms-backend
# Set environment variables
git push heroku main
```

## 📊 Development Timeline

- **✅ Week 1** (June 12-18): Project setup, basic UI, Firebase integration
- **🔄 Week 2** (June 19-25): Backend API, SMS processing, real-time updates  
- **⏳ Week 3** (June 26-July 2): Testing, deployment, documentation

## 🐛 Troubleshooting

### Common Issues
1. **CORS Errors**: Ensure backend is running on port 3001
2. **Firebase Errors**: Check configuration in `src/services/firebase.js`
3. **API Errors**: Verify backend is running and endpoints are accessible
4. **SMS Issues**: Check Twilio webhook configuration

### Debug Commands
```bash
# Check frontend logs
cd web/roadwise-tms && npm run dev

# Check backend logs  
cd web/roadwise-tms-backend && npm start

# Test API endpoints
curl http://localhost:3001/health
```

## 📞 Support

For issues or questions:
1. Check the console logs in browser (F12)
2. Check backend terminal for error messages
3. Verify all environment variables are set
4. Ensure Firebase and Twilio are properly configured

## 🎉 Success!

Your RoadWise TMS is now running! The system provides:
- Real-time traffic light control
- Intelligent travel recommendations  
- SMS-based data collection
- GPS location tracking
- Role-based user interfaces

Happy traffic management! 🚦 