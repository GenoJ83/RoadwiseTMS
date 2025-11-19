const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { sendSMS, sendTrafficCommand, sendEmergencyAlert } = require('../config/infobip');

// Twilio webhook endpoint for SMS from SIM800L
router.post('/', async (req, res) => {
  try {
    const { Body, From } = req.body;
    
    console.log('SMS received:', { Body, From });
    
    // Parse SMS format: "N:1,0,0.3,12.345678,98.765432"
    // Format: Direction:Vehicles,Cyclists,Congestion,Latitude,Longitude
    const smsData = parseSMSData(Body);
    
    if (!smsData) {
      return res.status(400).json({ error: 'Invalid SMS format' });
    }
    
    // Update Firestore with status data
    await updateStatusInFirestore(smsData);
    
    // Create alert log entry
    await createAlertLog(smsData);
    
    // Check for emergency conditions and send alerts
    await checkEmergencyConditions(smsData);
    
    res.status(200).json({ success: true, message: 'SMS processed successfully' });
    
  } catch (error) {
    console.error('SMS processing error:', error);
    res.status(500).json({ error: 'Failed to process SMS' });
  }
});

// Send SMS command to Arduino
router.post('/send', async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;
    
    if (!phoneNumber || !message) {
      return res.status(400).json({ error: 'Phone number and message are required' });
    }
    
    // For testing purposes, we'll simulate SMS sending
    // In production, this would call the actual SMS service
    const result = {
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'sent',
      to: phoneNumber,
      message: message,
      timestamp: new Date().toISOString()
    };
    
    console.log(`📱 SMS sent: ${phoneNumber} - ${message}`);
    
    res.status(200).json({ 
      success: true, 
      message: 'SMS sent successfully',
      messageId: result.messageId
    });
    
  } catch (error) {
    console.error('SMS sending error:', error);
    res.status(500).json({ error: 'Failed to send SMS' });
  }
});

// Get SMS history
router.get('/history', async (req, res) => {
  try {
    const { limit = 50, type } = req.query;
    
    // This would typically query Firestore for SMS history
    // For now, returning mock data
    const history = [
      {
        id: '1',
        type: 'incoming',
        from: '+1234567890',
        message: 'N:1,0,0.3,12.345678,98.765432',
        timestamp: new Date().toISOString(),
        status: 'processed'
      },
      {
        id: '2',
        type: 'outgoing',
        to: '+1234567890',
        message: 'N:RED',
        timestamp: new Date().toISOString(),
        status: 'sent'
      }
    ];
    
    res.status(200).json({ success: true, history });
    
  } catch (error) {
    console.error('SMS history error:', error);
    res.status(500).json({ error: 'Failed to fetch SMS history' });
  }
});

// Parse SMS data from SIM800L format
function parseSMSData(smsBody) {
  try {
    // Expected format: "N:1,0,0.3,12.345678,98.765432"
    const parts = smsBody.split(':');
    if (parts.length !== 2) return null;
    
    const direction = parts[0];
    const data = parts[1].split(',');
    
    if (data.length !== 5) return null;
    
    return {
      direction: direction.toUpperCase(),
      vehicles: parseInt(data[0]),
      cyclists: parseInt(data[1]),
      congestion: parseFloat(data[2]),
      latitude: parseFloat(data[3]),
      longitude: parseFloat(data[4]),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('SMS parsing error:', error);
    return null;
  }
}

// Update status in Firestore
async function updateStatusInFirestore(smsData) {
  try {
    const statusRef = db.collection('junction_status').doc(smsData.direction);
    
    await statusRef.set({
      state: 'Red', // Default state, will be updated by traffic control
      congestion: smsData.congestion,
      vehicles: smsData.vehicles,
      cyclists: smsData.cyclists > 0,
      greenTime: 15.0, // Default green time
      lastUpdated: smsData.timestamp,
      location: {
        latitude: smsData.latitude,
        longitude: smsData.longitude
      }
    }, { merge: true });
    
    console.log(`Status updated for ${smsData.direction}`);
  } catch (error) {
    console.error('Firestore update error:', error);
    throw error;
  }
}

// Create alert log entry
async function createAlertLog(smsData) {
  try {
    const alertRef = db.collection('alerts').doc();
    
    await alertRef.set({
      id: alertRef.id,
      message: `${smsData.direction} junction data received at Lat: ${smsData.latitude}, Lon: ${smsData.longitude}`,
      timestamp: smsData.timestamp,
      data: smsData
    });
    
    console.log('Alert log created');
  } catch (error) {
    console.error('Alert log error:', error);
    throw error;
  }
}

// Check for emergency conditions and send alerts
async function checkEmergencyConditions(smsData) {
  try {
    // Define emergency thresholds
    const emergencyThresholds = {
      vehicles: 50, // High vehicle count
      congestion: 0.8, // High congestion level
      cyclists: 10 // High cyclist count
    };
    
    const isEmergency = 
      smsData.vehicles > emergencyThresholds.vehicles ||
      smsData.congestion > emergencyThresholds.congestion ||
      smsData.cyclists > emergencyThresholds.cyclists;
    
    if (isEmergency) {
      const emergencyMessage = `Emergency at ${smsData.direction} junction: ${smsData.vehicles} vehicles, ${smsData.congestion} congestion, ${smsData.cyclists} cyclists`;
      
      // Get emergency contact numbers from Firestore (mock for now)
      const emergencyContacts = process.env.EMERGENCY_CONTACTS ? 
        process.env.EMERGENCY_CONTACTS.split(',') : 
        ['+1234567890'];
      
      await sendEmergencyAlert(emergencyContacts, emergencyMessage);
      
      // Log emergency alert
      const emergencyRef = db.collection('emergency_alerts').doc();
      await emergencyRef.set({
        id: emergencyRef.id,
        message: emergencyMessage,
        timestamp: smsData.timestamp,
        location: {
          latitude: smsData.latitude,
          longitude: smsData.longitude
        },
        data: smsData
      });
    }
  } catch (error) {
    console.error('Emergency check error:', error);
    // Don't throw error to avoid breaking main SMS processing
  }
}

// Log outgoing SMS
async function logSMSOutgoing(to, message, type, result) {
  try {
    const smsLogRef = db.collection('sms_logs').doc();
    
    await smsLogRef.set({
      id: smsLogRef.id,
      type: 'outgoing',
      to: to,
      message: message,
      smsType: type,
      timestamp: new Date().toISOString(),
      status: result.success ? 'sent' : 'failed',
      result: result
    });
    
    console.log('Outgoing SMS logged');
  } catch (error) {
    console.error('SMS logging error:', error);
    // Don't throw error to avoid breaking main SMS sending
  }
}

module.exports = router; 