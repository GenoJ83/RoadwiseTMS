#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ESP8266WebServer.h>
#include <ArduinoJson.h>
#include <WiFiClient.h>

const char* ssid = "Norbort";
const char* password = "@N0rb0rt";
const char* BACKEND_IP = "192.168.16.193";
const int BACKEND_PORT = 3001;
const char* BACKEND_ENDPOINT = "/api/command/traffic";

ESP8266WebServer server(80);
WiFiClient client;
HTTPClient http;

unsigned long lastPollTime = 0;
const int POLL_INTERVAL = 2000; // Poll every 2 seconds
const int WIFI_CHECK_INTERVAL = 5000; // Check WiFi every 5 seconds
unsigned long lastWiFiCheck = 0;
int failedRequests = 0;
const int MAX_FAILED_REQUESTS = 5;

#define BAUD_RATE 115200  // Must match Arduino Serial baud rate

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
    failedRequests = 0; // Reset failed requests counter on successful connection
  } else {
    Serial.println("\nFailed to connect to WiFi");
  }
}

void checkWiFiConnection() {
  if (WiFi.status() != WL_CONNECTED || failedRequests >= MAX_FAILED_REQUESTS) {
    Serial.println("WiFi connection lost or too many failed requests. Reconnecting...");
    WiFi.disconnect();
    delay(1000); // Wait a bit before reconnecting
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
      
      // Format and send command to Arduino
      String command = "N:" + n + " E:" + e + " S:" + s;
      Serial.println(command);
    } else if (payload != "NO_COMMAND") {
      // Handle legacy format or direct commands
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

void pollBackend() {
  if (WiFi.status() == WL_CONNECTED) {
    String url = "http://" + String(BACKEND_IP) + ":" + String(BACKEND_PORT) + String(BACKEND_ENDPOINT);
    
    http.begin(client, url);
    int httpCode = http.GET();
    
    if (httpCode > 0) {
      if (httpCode == HTTP_CODE_OK) {
        String payload = http.getString();
        Serial.println("Raw response: " + payload);
        processJsonResponse(payload);
        failedRequests = 0; // Reset counter on successful request
      } else {
        Serial.printf("HTTP error code: %d\n", httpCode);
        failedRequests++;
      }
    } else {
      Serial.printf("HTTP GET failed, error: %s\n", http.errorToString(httpCode).c_str());
      failedRequests++;
    }
    
    http.end();
  }
}

void setup() {
  Serial.begin(BAUD_RATE);
  setupWiFi();
  
  server.on("/setlights", HTTP_POST, []() {
    String cmd = server.arg("plain");
    Serial.println(cmd);
    server.send(200, "text/plain", "OK");
  });
  
  server.begin();
}

void loop() {
  unsigned long currentTime = millis();
  
  // Check WiFi connection periodically
  if (currentTime - lastWiFiCheck >= WIFI_CHECK_INTERVAL) {
    checkWiFiConnection();
    lastWiFiCheck = currentTime;
  }
  
  // Poll backend periodically
  if (currentTime - lastPollTime >= POLL_INTERVAL) {
    pollBackend();
    lastPollTime = currentTime;
  }
  
  server.handleClient();
  delay(10); // Small delay to prevent watchdog reset
} 