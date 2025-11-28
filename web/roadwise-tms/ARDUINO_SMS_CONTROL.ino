/*
 * Arduino <-> ESP8266 (NodeMCU) Serial Connection:
 *
 * Arduino TX (D1)  ---> [1kΩ]---+--- ESP8266 RX (D7/GPIO13)
 *                               |
 *                            [2kΩ]
 *                               |
 *                             GND
 * Arduino RX (D0)  <--- ESP8266 TX (D8/GPIO15) (direct)
 * GND <-----------> GND
 *
 * Use Serial.begin(9600) on both Arduino and ESP8266.
 *
 * Power NodeMCU via USB or stable 3.3V supply.
 */

#include <LiquidCrystal.h>

// Pin mapping: RS, E, D4, D5, D6, D7
LiquidCrystal lcd(A0, A1, A2, A3, A4, A5);

// Traffic light pins
#define RED_N 2
#define ORANGE_N 3
#define GREEN_N 4
#define BLUE_N 5
#define RED_E 6
#define ORANGE_E 7
#define GREEN_E 8
#define BLUE_E 9
#define RED_S 10
#define ORANGE_S 11
#define GREEN_S 12
#define BLUE_S 13

void setup() {
  lcd.begin(16, 2);
  for (int pin = 2; pin <= 13; pin++) pinMode(pin, OUTPUT);
  setAllRed();
  Serial.begin(9600);
}

void setAllRed() {
  digitalWrite(RED_N, HIGH); digitalWrite(ORANGE_N, LOW); digitalWrite(GREEN_N, LOW); digitalWrite(BLUE_N, LOW);
  digitalWrite(RED_E, HIGH); digitalWrite(ORANGE_E, LOW); digitalWrite(GREEN_E, LOW); digitalWrite(BLUE_E, LOW);
  digitalWrite(RED_S, HIGH); digitalWrite(ORANGE_S, LOW); digitalWrite(GREEN_S, LOW); digitalWrite(BLUE_S, LOW);
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("ALL RED - SAFE");
  lcd.setCursor(0, 1);
  lcd.print("Awaiting Cmd...");
}

void setLights(char dir, String color) {
  switch (dir) {
    case 'N':
      digitalWrite(RED_N, LOW); digitalWrite(ORANGE_N, LOW); digitalWrite(GREEN_N, LOW); digitalWrite(BLUE_N, LOW);
      if (color == "RED") digitalWrite(RED_N, HIGH);
      else if (color == "ORANGE") digitalWrite(ORANGE_N, HIGH);
      else if (color == "GREEN") digitalWrite(GREEN_N, HIGH);
      else if (color == "BLUE") digitalWrite(BLUE_N, HIGH);
      break;
    case 'E':
      digitalWrite(RED_E, LOW); digitalWrite(ORANGE_E, LOW); digitalWrite(GREEN_E, LOW); digitalWrite(BLUE_E, LOW);
      if (color == "RED") digitalWrite(RED_E, HIGH);
      else if (color == "ORANGE") digitalWrite(ORANGE_E, HIGH);
      else if (color == "GREEN") digitalWrite(GREEN_E, HIGH);
      else if (color == "BLUE") digitalWrite(BLUE_E, HIGH);
      break;
    case 'S':
      digitalWrite(RED_S, LOW); digitalWrite(ORANGE_S, LOW); digitalWrite(GREEN_S, LOW); digitalWrite(BLUE_S, LOW);
      if (color == "RED") digitalWrite(RED_S, HIGH);
      else if (color == "ORANGE") digitalWrite(ORANGE_S, HIGH);
      else if (color == "GREEN") digitalWrite(GREEN_S, HIGH);
      else if (color == "BLUE") digitalWrite(BLUE_S, HIGH);
      break;
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

void loop() {
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();
    int idx1 = cmd.indexOf(':');
    int idx2 = cmd.indexOf(':', idx1 + 1);
    int idx3 = cmd.indexOf(':', idx2 + 1);
    if (idx1 > 0 && idx2 > idx1 && idx3 > idx2) {
      String dir = cmd.substring(0, idx1);
      String color = cmd.substring(idx1 + 1, idx2);
      int vehicles = cmd.substring(idx2 + 1, idx3).toInt();
      int cyclists = cmd.substring(idx3 + 1).toInt();
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
} 