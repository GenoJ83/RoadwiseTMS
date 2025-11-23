# Arduino SMS Traffic Light Control Setup Guide

## Overview
This guide explains how to set up Arduino-based traffic light control that receives SMS commands from the RoadWise TMS web application.

## Traffic Light System

### 4 Traffic Light States:
1. **RED** - Stop all traffic (vehicles and cyclists)
2. **YELLOW** - Prepare to stop (warning signal)
3. **GREEN** - Go for vehicles only
4. **BLUE** - Go for cyclists only

### Traffic Light Priority:
- Only one direction can have GREEN or BLUE at a time
- RED and YELLOW can be set independently
- BLUE light is specifically for cyclists
- GREEN light is for vehicles only

## Hardware Requirements

### Required Components:
1. **Arduino Board** (Uno, Mega, or Nano)
2. **SIM800L GSM Module** (or similar GSM/GPRS module)
3. **Traffic Light LEDs** (Red, Yellow, Green, Blue)
4. **Resistors** (220Ω for LEDs)
5. **Breadboard and Jumper Wires**
6. **Power Supply** (12V for GSM module, 5V for Arduino)
7. **SIM Card** with SMS capability

### Optional Components:
- **GPS Module** (for location tracking)
- **Sensors** (vehicle detection, congestion monitoring)
- **LCD Display** (for status display)

## Wiring Diagram

### GSM Module Connections:
```
SIM800L    →  Arduino
VCC        →  12V Power Supply
GND        →  GND
RX         →  Pin 2 (GSM_TX)
TX         →  Pin 3 (GSM_RX)
PWRKEY     →  Pin 4 (GSM_POWER)
```

### Traffic Light Connections:
```
North Junction:
- Red LED    → Pin 5 (NORTH_RED)     - Stop all traffic
- Yellow LED → Pin 6 (NORTH_YELLOW)  - Prepare to stop
- Green LED  → Pin 7 (NORTH_GREEN)   - Vehicles go
- Blue LED   → Pin 8 (NORTH_BLUE)    - Cyclists go

East Junction:
- Red LED    → Pin 9 (EAST_RED)      - Stop all traffic
- Yellow LED → Pin 10 (EAST_YELLOW)  - Prepare to stop
- Green LED  → Pin 11 (EAST_GREEN)   - Vehicles go
- Blue LED   → Pin 12 (EAST_BLUE)    - Cyclists go

South Junction:
- Red LED    → Pin 13 (SOUTH_RED)    - Stop all traffic
- Yellow LED → Pin A0 (SOUTH_YELLOW) - Prepare to stop
- Green LED  → Pin A1 (SOUTH_GREEN)  - Vehicles go
- Blue LED   → Pin A2 (SOUTH_BLUE)   - Cyclists go
```

## Software Setup

### 1. Arduino IDE Setup
1. Install Arduino IDE
2. Install required libraries:
   - SoftwareSerial (built-in)
   - GSM (if using official GSM shield)

### 2. Code Upload
1. Open `ARDUINO_SMS_CONTROL.ino` in Arduino IDE
2. Select your Arduino board
3. Select the correct COM port
4. Upload the code

### 3. Configuration
Update these values in the Arduino code:
```cpp
// Replace with your server's phone number
String serverPhone = "+1234567890"; // Update this with actual server phone
```

## SMS Command Format

### Traffic Light Commands:
- `N:RED` - Set North junction to Red (stop all traffic)
- `E:GREEN` - Set East junction to Green (vehicles go)
- `S:BLUE` - Set South junction to Blue (cyclists go)
- `N:YELLOW` - Set North junction to Yellow (prepare to stop)

### Command Logic:
- When GREEN is set, all other directions go RED
- When BLUE is set, all other directions go RED
- YELLOW can be set independently
- RED can be set independently

### Data Reporting Format:
- `N:1,0,0.3,12.345678,98.765432`
  - N = Direction (North)
  - 1 = Number of vehicles
  - 0 = Number of cyclists
  - 0.3 = Congestion level (0-1)
  - 12.345678 = Latitude
  - 98.765432 = Longitude

## Testing the Setup

### 1. Basic Functionality Test
1. Power on the Arduino
2. Check Serial Monitor for initialization messages
3. Verify GSM module connects to network
4. Test SMS reception by sending a command

### 2. SMS Command Test
Send these test commands via SMS:
```
N:RED
E:GREEN
S:BLUE
N:YELLOW
```

### 3. Web Application Integration Test
1. Start the backend server
2. Start the frontend application
3. Go to Traffic Light Control panel
4. Click traffic light buttons
5. Verify SMS is sent to Arduino
6. Check Arduino responds correctly

## Traffic Light Behavior

### Normal Operation:
1. **Default State**: All junctions RED
2. **Vehicle Priority**: Set one direction to GREEN
3. **Cyclist Priority**: Set one direction to BLUE
4. **Warning**: Set YELLOW before changing to RED
5. **Safety**: Only one direction can be GREEN or BLUE at a time

### Emergency Mode:
- All lights flash RED rapidly
- Emergency vehicles can override
- System returns to normal after emergency

## Troubleshooting

### Common Issues:

#### 1. GSM Module Not Responding
- Check power supply (12V required)
- Verify SIM card is inserted and active
- Check antenna connection
- Test AT commands manually

#### 2. SMS Not Received
- Verify phone number format
- Check SMS storage settings
- Ensure SIM has SMS capability
- Test with manual SMS first

#### 3. Traffic Lights Not Working
- Check LED connections
- Verify pin assignments
- Test individual LEDs
- Check power supply

#### 4. Blue Light Not Working
- Verify blue LED is connected to correct pin
- Check blue LED polarity
- Test blue LED independently
- Ensure code handles BLUE state correctly

#### 5. Web App Not Sending Commands
- Verify backend is running
- Check API endpoints
- Verify phone number in frontend
- Check network connectivity

### Debug Commands:
```cpp
// Add to Arduino code for debugging
void debugGSM() {
  sendATCommand("AT+CPIN?", 1000);
  sendATCommand("AT+CREG?", 1000);
  sendATCommand("AT+CSQ", 1000);
  sendATCommand("AT+COPS?", 1000);
}

// Test all traffic lights
void testAllLights() {
  String states[] = {"RED", "YELLOW", "GREEN", "BLUE"};
  for (int i = 0; i < 4; i++) {
    setNorthLight(states[i]);
    delay(2000);
  }
  setAllRed();
}
```

## Security Considerations

### 1. Phone Number Validation
- Only accept commands from authorized numbers
- Implement whitelist of server phone numbers

### 2. Command Validation
- Validate command format before execution
- Implement timeout for commands
- Add checksum validation

### 3. Network Security
- Use HTTPS for web application
- Implement API authentication
- Log all commands for audit

## Advanced Features

### 1. Automatic Mode
```cpp
// Add automatic traffic light cycling
void automaticMode() {
  // Cycle through traffic lights automatically
  // Override with manual commands when needed
}
```

### 2. Emergency Mode
```cpp
// Emergency override functionality
void emergencyMode() {
  // Set all lights to red except emergency route
  // Send emergency notification
}
```

### 3. Data Collection
```cpp
// Collect and send traffic data
void collectTrafficData() {
  // Read sensors
  // Calculate congestion
  // Send data to server
}
```

## Maintenance

### Regular Tasks:
1. Check GSM signal strength
2. Monitor SMS balance
3. Test all traffic light states (RED, YELLOW, GREEN, BLUE)
4. Update Arduino code if needed
5. Backup configuration

### Monitoring:
- Log all commands received
- Monitor system uptime
- Track SMS usage
- Monitor traffic patterns

## Support

For technical support:
1. Check the troubleshooting section
2. Review Arduino Serial Monitor output
3. Test individual components
4. Contact system administrator

## Cost Estimation

### Hardware Costs:
- Arduino Uno: $20-30
- SIM800L Module: $15-25
- LEDs and Resistors: $5-10
- Power Supply: $10-20
- SIM Card: $5-15/month

### Total Setup Cost: $55-100 + monthly SMS costs

## Next Steps

1. **Deploy to Physical Location**
2. **Set up Monitoring Dashboard**
3. **Implement Data Analytics**
4. **Add More Junctions**
5. **Integrate with City Traffic Systems** 