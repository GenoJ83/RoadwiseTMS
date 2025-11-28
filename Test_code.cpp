// Include libraries
#include <LiquidCrystal.h>
#include <SoftwareSerial.h>

// Pin definitions for North (real ultrasonic data)
#define NORTH_TRIG 3
#define NORTH_ECHO A2
#define NORTH_RED 5
#define NORTH_YELLOW 6
#define NORTH_BLUE 7
#define NORTH_GREEN 8

// Pin definitions for LCD
#define LCD_RS 13
#define LCD_EN A5
#define LCD_D4 4
#define LCD_D5 A1
#define LCD_D6 A3
#define LCD_D7 A4

// GSM pins
#define GSM_RX 10
#define GSM_TX 11

// Traffic parameters
const float t_min = 10.0;
const float t_max = 30.0;
const float k = 0.15;
const int V_th = 20;
const int S_th = 10;
const float B_dur = 3.0;

// Initializing LCD and GSM
LiquidCrystal lcd(LCD_RS, LCD_EN, LCD_D4, LCD_D5, LCD_D6, LCD_D7);
SoftwareSerial gsmSerial(GSM_RX, GSM_TX);

String officerPhone = "+1234567890";

struct TrafficData {
  float timestamp;
  int vehicles;
  float speed;
  int cyclists;
};
TrafficData history[3][10]; // North[0], East[1], South[2]
int history_index[3] = {0, 0, 0};

const float W[4] = {0.5, -0.3, 0.2, 1.0};

void setup() {
  pinMode(NORTH_TRIG, OUTPUT);
  pinMode(NORTH_ECHO, INPUT);
  pinMode(NORTH_RED, OUTPUT);
  pinMode(NORTH_YELLOW, OUTPUT);
  pinMode(NORTH_BLUE, OUTPUT);
  pinMode(NORTH_GREEN, OUTPUT);
  pinMode(LCD_RS, OUTPUT);
  pinMode(LCD_EN, OUTPUT);
  pinMode(LCD_D4, OUTPUT);
  pinMode(LCD_D5, OUTPUT);
  pinMode(LCD_D6, OUTPUT);
  pinMode(LCD_D7, OUTPUT);

  Serial.begin(9600);
  gsmSerial.begin(9600);

  lcd.begin(16, 2);
  delay(2000); // Allow initialization
  lcd.print("RoadWise TMS");
  delay(2000);
  lcd.print("Initializing...");
  delay(2000);

  gsmSerial.println("AT");
  delay(1000);
  gsmSerial.println("AT+CMGF=1");
  delay(1000);
  gsmSerial.println("AT+CNMI=2,2,0,0,0");
  delay(1000);

  // Test LED pins
  digitalWrite(NORTH_GREEN, HIGH); delay(1000); digitalWrite(NORTH_GREEN, LOW);
  digitalWrite(NORTH_RED, HIGH); delay(1000); digitalWrite(NORTH_RED, LOW);

  setAllRed();
  sendSMS("System initialized at T-Junction");
}

void setAllRed() {
  digitalWrite(NORTH_RED, HIGH);
  digitalWrite(NORTH_YELLOW, LOW);
  digitalWrite(NORTH_BLUE, LOW);
  digitalWrite(NORTH_GREEN, LOW);
}

void setLEDState(int red, int yellow, int blue, int green) {
  digitalWrite(NORTH_RED, red ? HIGH : LOW);
  digitalWrite(NORTH_YELLOW, yellow ? HIGH : LOW);
  digitalWrite(NORTH_BLUE, blue ? HIGH : LOW);
  digitalWrite(NORTH_GREEN, green ? HIGH : LOW);
}

void sendSMS(String message) {
  gsmSerial.println("AT+CMGS=\"" + officerPhone + "\"");
  delay(1000);
  gsmSerial.print(message);
  gsmSerial.write(26);
  delay(1000);
}

String readSMS() {
  String sms = "";
  while (gsmSerial.available()) sms += char(gsmSerial.read());
  return sms;
}

float readUltrasonic() {
  digitalWrite(NORTH_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(NORTH_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(NORTH_TRIG, LOW);
  long duration = pulseIn(NORTH_ECHO, HIGH, 30000);
  float distance = duration * 0.034 / 2;
  Serial.print("Distance: "); Serial.println(distance);
  return distance > 0 && distance <= 400 ? 1 : 0; // Detect within sensor range
}

float calculateSpeed(float distance) {
  static float last_distance = 400;
  static unsigned long last_time = 0;
  unsigned long current_time = millis();
  float time_diff = (current_time - last_time) / 1000.0;
  float speed = time_diff > 0 ? (last_distance - distance) * 3.6 / time_diff : 10.0;
  last_distance = distance;
  last_time = current_time;
  return speed > 0 ? speed : 10.0;
}

void predictTraffic(int dir, float &V_pred, float &S_pred, int &Cyc_pred) {
  TrafficData last = history[dir][history_index[dir] % 10];
  V_pred = max(0.0, W[0] * last.vehicles + W[3]);
  S_pred = max(0.0, W[1] * last.speed + W[3]);
  Cyc_pred = W[2] * last.cyclists + W[3] > 0.5 ? 1 : 0;
}

void simulateSignalTiming(int dir, float G, int cyclists) {
  String dirName = (dir == 0 ? "North" : dir == 1 ? "East" : "South");
  if (dir == 0) { // North with real LEDs
    setLEDState(1, 0, 0, 0); lcd.setCursor(0, 1); lcd.print(dirName + ": Red   "); delay(2000);
    setLEDState(0, 1, 0, 0); lcd.setCursor(0, 1); lcd.print(dirName + ": Yellow"); delay(1000);
    if (cyclists) { setLEDState(0, 0, 1, 0); lcd.setCursor(0, 1); lcd.print(dirName + ": Blue  "); delay(B_dur * 1000); }
    setLEDState(0, 0, 0, 1); lcd.setCursor(0, 1); lcd.print(dirName + ": Green "); delay(G * 1000);
    setLEDState(1, 0, 0, 0); lcd.setCursor(0, 1); lcd.print(dirName + ": Red   ");
  } else { // East/South simulated on LCD only
    lcd.setCursor(0, 1); lcd.print(dirName + ": Red   "); delay(2000);
    lcd.setCursor(0, 1); lcd.print(dirName + ": Yellow"); delay(1000);
    if (cyclists) { lcd.setCursor(0, 1); lcd.print(dirName + ": Blue  "); delay(B_dur * 1000); }
    lcd.setCursor(0, 1); lcd.print(dirName + ": Green "); delay(G * 1000);
    lcd.setCursor(0, 1); lcd.print(dirName + ": Red   ");
  }
}

void processCommand(String command) {
  command.toUpperCase();
  if (command.indexOf("NORTH_GREEN") != -1) {
    setLEDState(0, 0, 0, 1);
    lcd.setCursor(0, 1);
    lcd.print("North: Green");
  }
  // Add other commands as needed
}

void loop() {
  String sms = readSMS();
  if (sms != "") processCommand(sms);

  // Prioritize ultrasonic sensor for North
  int V[3] = {0, 0, 0}, Cyc[3] = {0, 0, 0};
  float S[3] = {10.0, 10.0, 10.0};
  V[0] = readUltrasonic();
  if (V[0]) {
    Serial.println("Obstacle Detected, Turning Green");
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("North: Vehicles");
    lcd.setCursor(0, 1);
    lcd.print("detected");
    setLEDState(0, 0, 0, 1); // Turn green LED on
    delay(100); // Brief delay for visibility
  } else {
    Serial.println("No Obstacle");
    setAllRed(); // Reset to red when no obstacle
  }

  S[0] = calculateSpeed(V[0] * 400);
  Cyc[0] = random(2); // Mock cyclist data

  // Mock data for East and South
  if (millis() % 10000 < 5000) {
    V[1] = 1; Cyc[1] = 0; // East: Vehicle
    V[2] = 0; Cyc[2] = 1; // South: Cyclist
  } else {
    V[1] = 0; Cyc[1] = 1; // East: Cyclist
    V[2] = 1; Cyc[2] = 0; // South: Vehicle
  }

  // Update history
  float T = millis() / 1000.0;
  for (int dir = 0; dir < 3; dir++) {
    history[dir][history_index[dir] % 10] = {T, V[dir], S[dir], Cyc[dir]};
    history_index[dir]++;
  }

  // Run traffic simulation only if no obstacle detected
  if (!V[0]) {
    float V_pred[3], S_pred[3], C[3], G[3];
    int Cyc_pred[3];
    bool noTraffic = true;
    for (int dir = 0; dir < 3; dir++) {
      predictTraffic(dir, V_pred[dir], S_pred[dir], Cyc_pred[dir]);
      float C_real = 0.5 * (V[dir] / V_th) + 0.3 * (S_th / S[dir]) + 0.2 * Cyc[dir];
      float C_pred = 0.5 * (V_pred[dir] / V_th) + 0.3 * (S_th / S_pred[dir]) + 0.2 * Cyc_pred[dir];
      C[dir] = 0.7 * C_real + 0.3 * C_pred;
      G[dir] = t_min + (t_max - t_min) * (1 - exp(-k * C[dir]));
      if (V[dir] || Cyc[dir] || Cyc_pred[dir]) noTraffic = false;
    }

    if (sms == "" && !noTraffic) {
      for (int dir = 0; dir < 3; dir++) {
        lcd.clear();
        String direction = (dir == 0 ? "North" : dir == 1 ? "East" : "South");
        lcd.setCursor(0, 0);
        lcd.print(direction + ":C:" + String(C[dir], 2));
        simulateSignalTiming(dir, G[dir], Cyc[dir] || Cyc_pred[dir]);
      }
    }
  }

  delay(100); // Reduced delay for responsiveness
}