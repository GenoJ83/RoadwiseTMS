const twilio = require('twilio');

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// SMS sending function
async function sendSMS(to, message) {
  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });
    
    console.log(`SMS sent successfully to ${to}:`, result.sid);
    return {
      success: true,
      messageId: result.sid,
      status: result.status
    };
  } catch (error) {
    console.error('SMS sending error:', error);
    throw error;
  }
}

// Send traffic light command to Arduino
async function sendTrafficCommand(arduinoPhone, direction, state) {
  const command = `${direction}:${state}`;
  return await sendSMS(arduinoPhone, command);
}

// Send emergency alert
async function sendEmergencyAlert(phoneNumbers, message) {
  const results = [];
  
  for (const phone of phoneNumbers) {
    try {
      const result = await sendSMS(phone, `🚨 EMERGENCY: ${message}`);
      results.push({ phone, success: true, result });
    } catch (error) {
      results.push({ phone, success: false, error: error.message });
    }
  }
  
  return results;
}

// Send status update
async function sendStatusUpdate(phone, status) {
  const message = `Traffic Status Update:\n${status}`;
  return await sendSMS(phone, message);
}

module.exports = {
  client,
  sendSMS,
  sendTrafficCommand,
  sendEmergencyAlert,
  sendStatusUpdate
}; 