# RoadWise TMS (Traffic Management System)

A complete Intelligent Traffic Management System for T-junctions with Arduino integration, real-time web interface, and WiFi-based hardware control.

## Features

- **Traffic Light Control**: Real-time control of traffic lights for North, East, and South directions
- **Vehicle & Cyclist Detection**: AI-powered detection via web app camera
- **WiFi Communication**: NodeMCU (ESP8266) bridges web app and Arduino
- **LCD Display**: 16x2 parallel LCD shows current status
- **Role-based Access**: Traffic officer and road user interfaces
- **Travel Recommendations**: AI-powered travel time predictions
- **Real-time Monitoring**: Live status updates and alert logging

## System Architecture

```
[Web App (React)]
    |
    |  (HTTP POST: DIRECTION:COLOR:VEHICLES:CYCLISTS)
    v
[NodeMCU ESP8266 WiFi Bridge]
    |
    |  (Serial, 9600 baud)
    v
[Arduino Uno]
    |\
    | \-- [16x2 LCD Parallel]
    | \-- [Traffic Light LEDs (4 per direction)]
```

## Hardware Setup

### 1. **Wiring: NodeMCU (ESP8266) ↔ Arduino Uno**

| Arduino Uno | NodeMCU (ESP8266) | Notes                                 |
|-------------|-------------------|---------------------------------------|
| TX (D1)     | RX (D7/GPIO13)    | Use voltage divider (1kΩ/2kΩ)         |
| RX (D0)     | TX (D8/GPIO15)    | Direct (3.3V safe for Arduino)        |
| GND         | GND               | Common ground                         |

**Voltage Divider for Arduino TX → ESP8266 RX:**
- Arduino TX → 1kΩ → NodeMCU RX
- NodeMCU RX → 2kΩ → GND
- NodeMCU RX also connects to the junction between the two resistors

### 2. **Wiring: 16x2 Parallel LCD to Arduino Uno**

| LCD Pin | Arduino Uno Pin |
|---------|-----------------|
| RS      | A0              |
| E       | A1              |
| D4      | A2              |
| D5      | A3              |
| D6      | A4              |
| D7      | A5              |
| RW      | GND             |
| VSS     | GND             |
| VDD     | 5V              |
| VO      | Potentiometer   |
| A/K     | 5V/GND (backlight) |

### 3. **Traffic Light LEDs**
- North: 2, 3, 4, 5 (Red, Orange, Green, Blue)
- East: 6, 7, 8, 9
- South: 10, 11, 12, 13

### 4. **Power**
- Arduino Uno: USB or barrel jack
- NodeMCU: USB or stable 3.3V supply (not Arduino 3.3V pin)

## Software Setup

### 1. Frontend (Web App)
- Located in `web/roadwise-tms/`
- Sends HTTP POST to NodeMCU at `/setlights` with format: `DIRECTION:COLOR:VEHICLES:CYCLISTS` or `ALL:RED`
- Both manual and automatic modes supported

### 2. NodeMCU (ESP8266)
- Receives HTTP POST at `/setlights`
- Relays command to Arduino Uno via Serial (9600 baud)

### 3. Arduino Uno
- Receives serial commands, parses, and updates LEDs and LCD
- Handles `ALL:RED` for emergency mode
- LCD always shows the latest direction and status

## Example Command Flow

- Web App: `POST http://192.168.16.83/setlights` with body `NORTH:GREEN:12:2`
- NodeMCU: Relays `NORTH:GREEN:12:2` to Arduino Uno via Serial
- Arduino Uno: Turns on North Green LED, updates LCD with direction and vehicle/cyclist count

## Usage

- Use the web app dashboard for real-time and manual control
- Emergency mode sets all lights to red
- LCD displays the current direction and status

## Project Structure

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

## Technologies Used

- **Frontend**: React, Vite, Tailwind CSS, React Router
- **Backend**: Node.js, Express, Firebase Admin SDK
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **WiFi Bridge**: NodeMCU ESP8266
- **Hardware**: Arduino Uno, 16x2 LCD (parallel), LEDs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License. 