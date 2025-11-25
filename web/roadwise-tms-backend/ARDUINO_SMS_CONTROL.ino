/*
 * RoadWise TMS - Arduino SMS Traffic Light Control
 * 
 * This Arduino code receives SMS commands from the web application
 * and controls traffic lights accordingly.
 * 
 * Traffic Light States:
 * - RED: Stop all traffic
 * - YELLOW: Prepare to stop
 * - GREEN: Go for vehicles
 * - BLUE: Go for cyclists
 * 
 * Hardware Requirements:
 * - Arduino Uno/Mega
 * - SIM800L GSM Module
 * - Traffic Light LEDs (Red, Yellow, Green, Blue)
 * - Power supply
 * 
 * SMS Command Format: "N:RED", "E:GREEN", "S:BLUE"
 * Where: N=North, E=East, S=South, and state=RED/YELLOW/GREEN/BLUE
 */

#include <SoftwareSerial.h>
#include <LiquidCrystal.h>

// === CONFIGURABLE BAUD RATE ===
#define BAUD_RATE 115200  // Must match ESP8266 Serial baud rate

// GSM Module pins
#define GSM_RX 2
#define GSM_TX 3
#define GSM_POWER 4

// Traffic Light pins (North Junction)
#define NORTH_RED 5
#define NORTH_YELLOW 6
#define NORTH_GREEN 7
#define NORTH_BLUE 8

// Traffic Light pins (East Junction)
#define EAST_RED 9
#define EAST_YELLOW 10
#define EAST_GREEN 11
#define EAST_BLUE 12

// Traffic Light pins (South Junction)
#define SOUTH_RED 13
#define SOUTH_YELLOW A0
#define SOUTH_GREEN A1
#define SOUTH_BLUE A2

// LCD pin mapping: RS, E, D4, D5, D6, D7
LiquidCrystal lcd(A0, A1, A2, A3, A4, A5);

SoftwareSerial gsm(GSM_RX, GSM_TX);

// Current traffic light states
String currentState = "N:RED"; // Default state

// Traffic light timing (in milliseconds)
const unsigned long YELLOW_DURATION = 3000; // 3 seconds
const unsigned long GREEN_DURATION = 30000; // 30 seconds
const unsigned long BLUE_DURATION = 15000;  // 15 seconds for cyclists

void setup() {
  Serial.begin(BAUD_RATE);
  gsm.begin(9600);
  lcd.begin(16, 2);
  
  // Initialize traffic light pins
  pinMode(NORTH_RED, OUTPUT);
  pinMode(NORTH_YELLOW, OUTPUT);
  pinMode(NORTH_GREEN, OUTPUT);
  pinMode(NORTH_BLUE, OUTPUT);
  
  pinMode(EAST_RED, OUTPUT);
  pinMode(EAST_YELLOW, OUTPUT);
  pinMode(EAST_GREEN, OUTPUT);
  pinMode(EAST_BLUE, OUTPUT);
  
  pinMode(SOUTH_RED, OUTPUT);
  pinMode(SOUTH_YELLOW, OUTPUT);
  pinMode(SOUTH_GREEN, OUTPUT);
  pinMode(SOUTH_BLUE, OUTPUT);
  
  // Initialize GSM module
  initializeGSM();
  
  // Set default state (all red)
  setAllRed();
  
  Serial.println("RoadWise TMS Arduino Controller Ready!");
  Serial.println("Traffic Light States: RED, YELLOW, GREEN, BLUE (Cyclists)");
}

void loop() {
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();
    Serial.println("Received: " + cmd); // Debug print
    int idx1 = cmd.indexOf(':');
    int idx2 = cmd.indexOf(':', idx1 + 1);
    int idx3 = cmd.indexOf(':', idx2 + 1);
    if (idx1 > 0 && idx2 > idx1 && idx3 > idx2) {
      String dir = cmd.substring(0, idx1);
      String color = cmd.substring(idx1 + 1, idx2);
      int vehicles = cmd.substring(idx2 + 1, idx3).toInt();
      int cyclists = cmd.substring(idx3 + 1).toInt();
      Serial.print("Parsed: "); Serial.print(dir); Serial.print(", "); Serial.println(color); // Debug print
      if (dir == "NORTH") {
        setLights('N', color);
        updateLCD("NORTH", color, vehicles, cyclists);
      } else if (dir == "EAST") {
        setLights('E', color);
        updateLCD("EAST", color, vehicles, cyclists);
      } else if (dir == "SOUTH") {
        setLights('S', color);
        updateLCD("SOUTH", color, vehicles, cyclists);
      }
    } else if (cmd == "ALL:RED") {
      setAllRed();
    }
  }
  
  // Check for incoming SMS
  if (gsm.available()) {
    String response = gsm.readString();
    Serial.println("GSM Response: " + response);
    
    // Check if SMS was received
    if (response.indexOf("+CMTI:") != -1) {
      readSMS();
    }
  }
  
  delay(1000);
}

void initializeGSM() {
  Serial.println("Initializing GSM module...");
  
  // Power on GSM module
  digitalWrite(GSM_POWER, HIGH);
  delay(3000);
  
  // Test AT commands
  sendATCommand("AT", 1000);
  sendATCommand("AT+CPIN?", 1000);
  sendATCommand("AT+CREG?", 1000);
  sendATCommand("AT+CSQ", 1000);
  
  // Set SMS text mode
  sendATCommand("AT+CMGF=1", 1000);
  
  // Set SMS storage to SIM
  sendATCommand("AT+CPMS=\"SM\"", 1000);
  
  Serial.println("GSM module initialized!");
}

void sendATCommand(String command, int timeout) {
  Serial.println("Sending: " + command);
  gsm.println(command);
  delay(timeout);
  
  while (gsm.available()) {
    Serial.write(gsm.read());
  }
}

void readSMS() {
  Serial.println("Reading SMS...");
  
  // Read the SMS
  gsm.println("AT+CMGR=1");
  delay(1000);
  
  String response = "";
  while (gsm.available()) {
    response += gsm.readString();
  }
  
  Serial.println("SMS Content: " + response);
  
  // Extract SMS text
  int startIndex = response.indexOf("\r\n\r\n");
  int endIndex = response.indexOf("\r\nOK");
  
  if (startIndex != -1 && endIndex != -1) {
    String smsText = response.substring(startIndex + 4, endIndex);
    smsText.trim();
    
    Serial.println("SMS Text: " + smsText);
    
    // Process the command
    processTrafficCommand(smsText);
  }
  
  // Delete the SMS
  gsm.println("AT+CMGD=1");
  delay(1000);
}

void processTrafficCommand(String command) {
  Serial.println("Processing command: " + command);
  
  // Parse command format: "N:RED", "E:GREEN", etc.
  int colonIndex = command.indexOf(':');
  if (colonIndex != -1) {
    String direction = command.substring(0, colonIndex);
    String state = command.substring(colonIndex + 1);
    
    Serial.println("Direction: " + direction + ", State: " + state);
    
    // Validate state
    if (isValidState(state)) {
      // Execute the command
      executeTrafficCommand(direction, state);
      
      // Send confirmation SMS back to server
      sendConfirmationSMS(command);
    } else {
      Serial.println("Invalid state: " + state);
      sendErrorSMS("Invalid state: " + state);
    }
  }
}

bool isValidState(String state) {
  state.toUpperCase();
  return (state == "RED" || state == "YELLOW" || state == "GREEN" || state == "BLUE");
}

void executeTrafficCommand(String direction, String state) {
  // Set all lights to red first (safety measure)
  setAllRed();
  delay(500); // Brief pause for safety
  
  // Set the specific direction and state
  if (direction == "N") {
    setNorthLight(state);
    Serial.println("North junction set to: " + state);
  } else if (direction == "E") {
    setEastLight(state);
    Serial.println("East junction set to: " + state);
  } else if (direction == "S") {
    setSouthLight(state);
    Serial.println("South junction set to: " + state);
  } else {
    Serial.println("Invalid direction: " + direction);
    return;
  }
  
  currentState = direction + ":" + state;
  Serial.println("Traffic light updated: " + currentState);
  
  // Log the state change with description
  String stateDescription = getStateDescription(state);
  Serial.println("State Description: " + stateDescription);
}

String getStateDescription(String state) {
  if (state == "RED") return "STOP - All traffic must stop";
  if (state == "YELLOW") return "PREPARE - Prepare to stop";
  if (state == "GREEN") return "GO - Vehicles can proceed";
  if (state == "BLUE") return "CYCLISTS - Cyclists can proceed";
  return "UNKNOWN";
}

void setAllRed() {
  // Set all junctions to red
  digitalWrite(NORTH_RED, HIGH);
  digitalWrite(NORTH_YELLOW, LOW);
  digitalWrite(NORTH_GREEN, LOW);
  digitalWrite(NORTH_BLUE, LOW);
  
  digitalWrite(EAST_RED, HIGH);
  digitalWrite(EAST_YELLOW, LOW);
  digitalWrite(EAST_GREEN, LOW);
  digitalWrite(EAST_BLUE, LOW);
  
  digitalWrite(SOUTH_RED, HIGH);
  digitalWrite(SOUTH_YELLOW, LOW);
  digitalWrite(SOUTH_GREEN, LOW);
  digitalWrite(SOUTH_BLUE, LOW);
  
  Serial.println("All traffic lights set to RED");
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("ALL RED - SAFE");
  lcd.setCursor(0, 1);
  lcd.print("Awaiting Cmd...");
}

void setNorthLight(String state) {
  // Turn off all North lights first
  digitalWrite(NORTH_RED, LOW);
  digitalWrite(NORTH_YELLOW, LOW);
  digitalWrite(NORTH_GREEN, LOW);
  digitalWrite(NORTH_BLUE, LOW);
  
  // Set the specified state
  if (state == "RED") {
    digitalWrite(NORTH_RED, HIGH);
    Serial.println("North: RED - STOP");
  } else if (state == "YELLOW") {
    digitalWrite(NORTH_YELLOW, HIGH);
    Serial.println("North: YELLOW - PREPARE TO STOP");
  } else if (state == "GREEN") {
    digitalWrite(NORTH_GREEN, HIGH);
    Serial.println("North: GREEN - VEHICLES GO");
  } else if (state == "BLUE") {
    digitalWrite(NORTH_BLUE, HIGH);
    Serial.println("North: BLUE - CYCLISTS GO");
  }
}

void setEastLight(String state) {
  // Turn off all East lights first
  digitalWrite(EAST_RED, LOW);
  digitalWrite(EAST_YELLOW, LOW);
  digitalWrite(EAST_GREEN, LOW);
  digitalWrite(EAST_BLUE, LOW);
  
  // Set the specified state
  if (state == "RED") {
    digitalWrite(EAST_RED, HIGH);
    Serial.println("East: RED - STOP");
  } else if (state == "YELLOW") {
    digitalWrite(EAST_YELLOW, HIGH);
    Serial.println("East: YELLOW - PREPARE TO STOP");
  } else if (state == "GREEN") {
    digitalWrite(EAST_GREEN, HIGH);
    Serial.println("East: GREEN - VEHICLES GO");
  } else if (state == "BLUE") {
    digitalWrite(EAST_BLUE, HIGH);
    Serial.println("East: BLUE - CYCLISTS GO");
  }
}

void setSouthLight(String state) {
  // Turn off all South lights first
  digitalWrite(SOUTH_RED, LOW);
  digitalWrite(SOUTH_YELLOW, LOW);
  digitalWrite(SOUTH_GREEN, LOW);
  digitalWrite(SOUTH_BLUE, LOW);
  
  // Set the specified state
  if (state == "RED") {
    digitalWrite(SOUTH_RED, HIGH);
    Serial.println("South: RED - STOP");
  } else if (state == "YELLOW") {
    digitalWrite(SOUTH_YELLOW, HIGH);
    Serial.println("South: YELLOW - PREPARE TO STOP");
  } else if (state == "GREEN") {
    digitalWrite(SOUTH_GREEN, HIGH);
    Serial.println("South: GREEN - VEHICLES GO");
  } else if (state == "BLUE") {
    digitalWrite(SOUTH_BLUE, HIGH);
    Serial.println("South: BLUE - CYCLISTS GO");
  }
}

void sendConfirmationSMS(String command) {
  // Send confirmation SMS back to server
  String message = "CMD_EXECUTED:" + command;
  
  // Replace with your server's phone number
  String serverPhone = "+1234567890"; // Update this with actual server phone
  
  gsm.println("AT+CMGS=\"" + serverPhone + "\"");
  delay(1000);
  gsm.println(message);
  delay(1000);
  gsm.write(26); // Ctrl+Z to send
  delay(1000);
  
  Serial.println("Confirmation SMS sent: " + message);
}

void sendErrorSMS(String error) {
  // Send error SMS back to server
  String message = "CMD_ERROR:" + error;
  
  // Replace with your server's phone number
  String serverPhone = "+1234567890"; // Update this with actual server phone
  
  gsm.println("AT+CMGS=\"" + serverPhone + "\"");
  delay(1000);
  gsm.println(message);
  delay(1000);
  gsm.write(26); // Ctrl+Z to send
  delay(1000);
  
  Serial.println("Error SMS sent: " + message);
}

/*
 * Emergency Mode Functions
 */
void emergencyMode() {
  Serial.println("EMERGENCY MODE ACTIVATED");
  
  // Flash all red lights rapidly
  for (int i = 0; i < 10; i++) {
    setAllRed();
    delay(500);
    turnOffAllLights();
    delay(500);
  }
  
  // Set all to red
  setAllRed();
  
  // Send emergency notification
  sendEmergencySMS();
}

void turnOffAllLights() {
  digitalWrite(NORTH_RED, LOW);
  digitalWrite(NORTH_YELLOW, LOW);
  digitalWrite(NORTH_GREEN, LOW);
  digitalWrite(NORTH_BLUE, LOW);
  
  digitalWrite(EAST_RED, LOW);
  digitalWrite(EAST_YELLOW, LOW);
  digitalWrite(EAST_GREEN, LOW);
  digitalWrite(EAST_BLUE, LOW);
  
  digitalWrite(SOUTH_RED, LOW);
  digitalWrite(SOUTH_YELLOW, LOW);
  digitalWrite(SOUTH_GREEN, LOW);
  digitalWrite(SOUTH_BLUE, LOW);
}

void sendEmergencySMS() {
  String message = "EMERGENCY:ALL_TRAFFIC_STOPPED";
  
  // Replace with your server's phone number
  String serverPhone = "+1234567890"; // Update this with actual server phone
  
  gsm.println("AT+CMGS=\"" + serverPhone + "\"");
  delay(1000);
  gsm.println(message);
  delay(1000);
  gsm.write(26); // Ctrl+Z to send
  delay(1000);
  
  Serial.println("Emergency SMS sent: " + message);
}

/*
 * SMS Data Sending Function (for sending traffic data back to server)
 * Format: "N:1,0,0.3,12.345678,98.765432"
 * Where: Direction:Vehicles,Cyclists,Congestion,Latitude,Longitude
 */
void sendTrafficData(String direction, int vehicles, int cyclists, float congestion, float lat, float lon) {
  String dataMessage = direction + ":" + vehicles + "," + cyclists + "," + congestion + "," + lat + "," + lon;
  
  // Replace with your server's phone number
  String serverPhone = "+1234567890"; // Update this with actual server phone
  
  gsm.println("AT+CMGS=\"" + serverPhone + "\"");
  delay(1000);
  gsm.println(dataMessage);
  delay(1000);
  gsm.write(26); // Ctrl+Z to send
  delay(1000);
  
  Serial.println("Traffic data sent: " + dataMessage);
}

/*
 * Test Function - Cycles through all traffic light states
 */
void testAllLights() {
  Serial.println("Testing all traffic lights...");
  
  String directions[] = {"N", "E", "S"};
  String states[] = {"RED", "YELLOW", "GREEN", "BLUE"};
  
  for (int d = 0; d < 3; d++) {
    for (int s = 0; s < 4; s++) {
      Serial.println("Testing " + directions[d] + ":" + states[s]);
      executeTrafficCommand(directions[d], states[s]);
      delay(2000); // Wait 2 seconds between tests
    }
  }
  
  // Return to all red
  setAllRed();
  Serial.println("Traffic light test completed");
}

void setLights(char dir, String color) {
  if (dir == 'N') {
    digitalWrite(NORTH_RED, LOW); digitalWrite(NORTH_YELLOW, LOW); digitalWrite(NORTH_GREEN, LOW); digitalWrite(NORTH_BLUE, LOW);
    if (color == "RED") digitalWrite(NORTH_RED, HIGH);
    else if (color == "YELLOW") digitalWrite(NORTH_YELLOW, HIGH);
    else if (color == "GREEN") digitalWrite(NORTH_GREEN, HIGH);
    else if (color == "BLUE") digitalWrite(NORTH_BLUE, HIGH);
  } else if (dir == 'E') {
    digitalWrite(EAST_RED, LOW); digitalWrite(EAST_YELLOW, LOW); digitalWrite(EAST_GREEN, LOW); digitalWrite(EAST_BLUE, LOW);
    if (color == "RED") digitalWrite(EAST_RED, HIGH);
    else if (color == "YELLOW") digitalWrite(EAST_YELLOW, HIGH);
    else if (color == "GREEN") digitalWrite(EAST_GREEN, HIGH);
    else if (color == "BLUE") digitalWrite(EAST_BLUE, HIGH);
  } else if (dir == 'S') {
    digitalWrite(SOUTH_RED, LOW); digitalWrite(SOUTH_YELLOW, LOW); digitalWrite(SOUTH_GREEN, LOW); digitalWrite(SOUTH_BLUE, LOW);
    if (color == "RED") digitalWrite(SOUTH_RED, HIGH);
    else if (color == "YELLOW") digitalWrite(SOUTH_YELLOW, HIGH);
    else if (color == "GREEN") digitalWrite(SOUTH_GREEN, HIGH);
    else if (color == "BLUE") digitalWrite(SOUTH_BLUE, HIGH);
  }
}

void updateLCD(String dir, String color, int vehicles, int cyclists) {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(dir + ": " + color);
  lcd.setCursor(0, 1);
  lcd.print("Cars:");
  lcd.print(vehicles);
  lcd.print(" Cyc:");
  lcd.print(cyclists);
} 