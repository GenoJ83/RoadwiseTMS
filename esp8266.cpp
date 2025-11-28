#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>
#include "secrets.h"

const char* ssid = WIFI_SSID;
const char* password = WIFI_PASSWORD;
const char* backendUrl = "http://172.20.10.3:3001/api/command/traffic";

#define BAUD_RATE 9600

unsigned long lastPollTime = 0;
const int POLL_INTERVAL = 2000;  // Polling every 2 seconds
unsigned long lastWiFiCheck = 0;
const int WIFI_CHECK_INTERVAL = 5000;  // Checking WiFi every 5 seconds
int failedRequests = 0;
const int MAX_FAILED_REQUESTS = 5;

void setupWiFi() {
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nConnected to WiFi");
    Serial.print("NodeMCU IP Address: ");
    Serial.println(WiFi.localIP());
    failedRequests = 0;
  } else {
    Serial.println("\nFailed to connect to WiFi");
  }
}

void checkWiFiConnection() {
  if (WiFi.status() != WL_CONNECTED || failedRequests >= MAX_FAILED_REQUESTS) {
    Serial.println("WiFi connection lost or too many failed requests. Reconnecting...");
    WiFi.disconnect();
    delay(1000);
    setupWiFi();
  }
}

void processJsonResponse(String payload) {
  StaticJsonDocument<256> doc;
  DeserializationError error = deserializeJson(doc, payload);

  if (!error) {
    if (doc.containsKey("commands")) {
      JsonObject commands = doc["commands"];
      String n = commands["N"] | "RED";
      String e = commands["E"] | "RED";
      String s = commands["S"] | "RED";
      
      // Formatting and send command to Arduino
      String command = "N:" + n + " E:" + e + " S:" + s;
      Serial.println(command);
    } else if (payload != "NO_COMMAND") {
      // Handling legacy format or direct commands
      Serial.println(payload);
    }
  } else {
    Serial.print("JSON parse error: ");
    Serial.println(error.c_str());
    if (payload != "NO_COMMAND") {
      // If not JSON and not NO_COMMAND, try sending as direct command
      Serial.println(payload);
    }
  }
}

void setup() {
  Serial.begin(BAUD_RATE);
  setupWiFi();
}

void loop() {
  unsigned long currentTime = millis();
  
  // Checking WiFi connection periodically
  if (currentTime - lastWiFiCheck >= WIFI_CHECK_INTERVAL) {
    checkWiFiConnection();
    lastWiFiCheck = currentTime;
  }

  // Polling backend if connected
  if (currentTime - lastPollTime >= POLL_INTERVAL && WiFi.status() == WL_CONNECTED) {
    WiFiClient wifiClient;
    HTTPClient http;
    
    http.begin(wifiClient, backendUrl);
    int httpCode = http.GET();
    
    if (httpCode > 0) {
      if (httpCode == HTTP_CODE_OK) {
        String payload = http.getString();
        Serial.println("Raw response: " + payload);
        processJsonResponse(payload);
        failedRequests = 0;
      } else {
        Serial.printf("HTTP error code: %d\n", httpCode);
        failedRequests++;
      }
    } else {
      Serial.printf("HTTP GET failed, error: %s\n", http.errorToString(httpCode).c_str());
      failedRequests++;
    }
    
    http.end();
    lastPollTime = currentTime;
  }
  
  delay(10); // Small delay to prevent watchdog reset
}