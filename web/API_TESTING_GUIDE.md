# API Testing Guide for RoadWise TMS

## 🚀 Quick Start

### 1. Start the Backend Server
```bash
cd web/roadwise-tms-backend
npm start
```

### 2. Start the Frontend Server
```bash
cd web/roadwise-tms
npm run dev
```

## 📋 Available API Endpoints

### Health Check
- **GET** `http://localhost:3001/health` - Root health check
- **GET** `http://localhost:3001/api/health` - API health check (via proxy)

### SMS Service
- **POST** `http://localhost:3001/api/sms/send` - Send SMS
- **GET** `http://localhost:3001/api/sms/history` - Get SMS history
- **GET** `http://localhost:3001/api/sms/status/:id` - Get SMS status

### Command Service
- **POST** `http://localhost:3001/api/command/traffic` - Send traffic command
- **GET** `http://localhost:3001/api/command/traffic` - Get latest traffic command (plain string, for NodeMCU polling)
- **GET** `http://localhost:3001/api/command/history` - Get command history
- **GET** `http://localhost:3001/api/command/status` - Get system status

## 🧪 Testing Methods

### Method 1: Using cURL (Command Line)

#### Test Health Endpoint
```bash
curl http://localhost:3001/health
curl http://localhost:3001/api/health
```

#### Test SMS Endpoint
```bash
curl -X POST http://localhost:3001/api/sms/send \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+1234567890", "message": "Test SMS"}'
```

#### Test Traffic Command
```bash
curl -X POST http://localhost:3001/api/command/traffic \
  -H "Content-Type: application/json" \
  -d '{"junction": "north", "command": "set_green", "priority": "normal"}'
```

#### Test Latest Traffic Command (NodeMCU Polling)
```bash
curl http://localhost:3001/api/command/traffic
```

### Method 2: Using PowerShell (Windows)

#### Test Health Endpoint
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/health" -Method Get
```

#### Test SMS Endpoint
```powershell
$body = @{
    phoneNumber = "+1234567890"
    message = "Test SMS from PowerShell"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/sms/send" -Method Post -Body $body -ContentType "application/json"
```

### Method 3: Using Browser Developer Tools

1. **Open your browser** and go to `http://localhost:5173`
2. **Press F12** to open Developer Tools
3. **Go to Console tab** and run:

```javascript
// Test health endpoint
fetch('/api/health')
  .then(response => response.json())
  .then(data => console.log('Health:', data))
  .catch(error => console.error('Error:', error));

// Test SMS endpoint
fetch('/api/sms/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    phoneNumber: '+1234567890',
    message: 'Test SMS from browser'
  })
})
.then(response => response.json())
.then(data => console.log('SMS Result:', data))
.catch(error => console.error('Error:', error));
```

### Method 4: Using the Frontend Test Component

1. **Start both servers**
2. **Open** `http://localhost:5173`
3. **Login** to access the dashboard
4. **Use the Backend Test component** to test endpoints

### Method 5: Using Postman or Similar Tools

#### Health Check
- **Method**: GET
- **URL**: `http://localhost:3001/api/health`

#### Send SMS
- **Method**: POST
- **URL**: `http://localhost:3001/api/sms/send`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "phoneNumber": "+1234567890",
  "message": "Test SMS from Postman"
}
```

#### Send Traffic Command
- **Method**: POST
- **URL**: `http://localhost:3001/api/command/traffic`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "junction": "north",
  "command": "set_green",
  "priority": "normal"
}
```

## 🔍 Troubleshooting

### Common Issues

#### 1. "Connection Refused" Error
- **Solution**: Make sure the backend server is running
- **Check**: `curl http://localhost:3001/health`

#### 2. CORS Errors
- **Solution**: Backend has CORS enabled, but check if frontend proxy is working
- **Test**: Use the proxy URL `/api/health` instead of direct backend URL

#### 3. "Cannot find module" Error
- **Solution**: Install dependencies
- **Run**: `npm install` in both frontend and backend directories

#### 4. Port Already in Use
- **Solution**: Kill existing processes
- **Run**: `taskkill /f /im node.exe` (Windows)

### Testing Checklist

- [ ] Backend server running on port 3001
- [ ] Frontend server running on port 5173
- [ ] Health endpoint responding
- [ ] API endpoints accessible via proxy
- [ ] CORS headers present
- [ ] JSON responses properly formatted

## 📊 Expected Responses

### Health Check Response
```json
{
  "status": "OK",
  "message": "RoadWise TMS Backend API is running"
}
```

### SMS Send Response
```json
{
  "success": true,
  "message": "SMS sent successfully",
  "messageId": "msg_123456789"
}
```

### Traffic Command Response
```json
{
  "success": true,
  "message": "Traffic command sent successfully",
  "command": {
    "id": "cmd_123456789",
    "junction": "north",
    "command": "set_green",
    "priority": "normal",
    "timestamp": "2025-06-18T11:45:00.000Z",
    "status": "sent"
  }
}
```

## 🎯 Quick Test Script

Create a file called `test-api.ps1` in the web directory:

```powershell
Write-Host "Testing RoadWise TMS API Endpoints..." -ForegroundColor Green

# Test health endpoint
Write-Host "`n1. Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method Get
    Write-Host "✅ Health Check: $($health.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test API health endpoint
Write-Host "`n2. Testing API Health Endpoint..." -ForegroundColor Yellow
try {
    $apiHealth = Invoke-RestMethod -Uri "http://localhost:3001/api/health" -Method Get
    Write-Host "✅ API Health Check: $($apiHealth.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ API Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nAPI Testing Complete!" -ForegroundColor Green
```

Run it with: `.\test-api.ps1` 