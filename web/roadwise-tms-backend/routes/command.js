const express = require('express');
const router = express.Router();
const { sendTrafficCommand } = require('../config/infobip');

// In-memory storage for command history (in production, use a database)
let commandHistory = [];
let systemStatus = {
  isOnline: true,
  lastUpdate: new Date(),
  currentMode: 'automatic',
  activeJunctions: ['north', 'east', 'south']
};

// Add round-robin state
const roundRobinOrder = ['north', 'east', 'south'];
let currentIndex = 0;
let lastGreenTimes = { north: 0, east: 0, south: 0 };

// Send traffic light command
router.post('/traffic', async (req, res) => {
  try {
    const { junction, command, priority, arduinoPhone } = req.body;
    
    if (!junction || !command) {
      return res.status(400).json({ 
        error: 'Missing required fields: junction and command' 
      });
    }

    const commandData = {
      id: `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      junction,
      command,
      priority: priority || 'normal',
      timestamp: new Date(),
      status: 'sent',
      arduinoPhone: arduinoPhone || null
    };

    // Add to history
    commandHistory.unshift(commandData);

    // Keep only last 100 commands
    if (commandHistory.length > 100) {
      commandHistory = commandHistory.slice(0, 100);
    }

    // Update system status
    systemStatus.lastUpdate = new Date();

    console.log(`🚦 Traffic command sent: ${junction} junction - ${command}`);

    // Send SMS to Arduino if phone number provided
    if (arduinoPhone) {
      try {
        // Extract direction and state from command (e.g., "N:RED" -> direction="N", state="RED")
        const [direction, state] = command.split(':');
        
        const smsResult = await sendTrafficCommand(arduinoPhone, direction, state);
        console.log(`📱 SMS sent to Arduino ${arduinoPhone}: ${command}`, smsResult);
        
        commandData.smsSent = true;
        commandData.smsResult = smsResult;
      } catch (smsError) {
        console.error(`❌ Failed to send SMS to Arduino ${arduinoPhone}:`, smsError);
        commandData.smsSent = false;
        commandData.smsError = smsError.message;
        // Continue with the response even if SMS fails
      }
    } else {
      console.log(`🌐 Command available for NodeMCU (HTTP): ${command}`);
      // commandData.smsSent = false; // No longer relevant for HTTP
    }

    // After adding to commandHistory, log the full state for all directions
    const directions = [
      { key: 'N', name: 'north' },
      { key: 'E', name: 'east' },
      { key: 'S', name: 'south' }
    ];
    const commands = { N: 'RED', E: 'RED', S: 'RED' };
    for (const dir of directions) {
      const found = commandHistory.find(cmd => cmd.junction === dir.name);
      if (found) {
        const color = found.command.split(':')[1];
        commands[dir.key] = color;
      }
    }
    console.log(`🌐 NodeMCU State: N:${commands.N} E:${commands.E} S:${commands.S}`);

    res.json({
      success: true,
      message: 'Traffic command sent successfully',
      command: commandData
    });

  } catch (error) {
    console.error('Error sending traffic command:', error);
    res.status(500).json({ error: 'Failed to send traffic command' });
  }
});

// Get command history
router.get('/history', (req, res) => {
  try {
    const { limit = 50, junction } = req.query;
    
    let filteredHistory = commandHistory;
    
    if (junction) {
      filteredHistory = commandHistory.filter(cmd => cmd.junction === junction);
    }

    const limitedHistory = filteredHistory.slice(0, parseInt(limit));

    res.json({
      success: true,
      commands: limitedHistory,
      total: filteredHistory.length
    });

  } catch (error) {
    console.error('Error getting command history:', error);
    res.status(500).json({ error: 'Failed to fetch command history' });
  }
});

// Get system status
router.get('/status', (req, res) => {
  try {
    res.json({
      success: true,
      status: systemStatus,
      stats: {
        totalCommands: commandHistory.length,
        recentCommands: commandHistory.slice(0, 10).length,
        systemUptime: Date.now() - systemStatus.lastUpdate.getTime()
      }
    });

  } catch (error) {
    console.error('Error getting system status:', error);
    res.status(500).json({ error: 'Failed to fetch system status' });
  }
});

// Add GET endpoint for NodeMCU to fetch the latest command
router.get('/traffic', (req, res) => {
  try {
    // Build a map of the latest color for each direction using initials
    const directions = [
      { key: 'N', name: 'north' },
      { key: 'E', name: 'east' },
      { key: 'S', name: 'south' }
    ];
    const commands = { N: 'RED', E: 'RED', S: 'RED' }; // Default to RED
    for (const dir of directions) {
      const found = commandHistory.find(cmd => cmd.junction === dir.name);
      if (found) {
        const color = found.command.split(':')[1];
        commands[dir.key] = color;
      }
    }
    res.json({ commands });
  } catch (err) {
    res.status(500).json({ commands: { N: 'RED', E: 'RED', S: 'RED' } });
  }
});

// Automated command update based on real-time sensor data
router.post('/auto-update', (req, res) => {
  const { sensorData } = req.body;
  if (!sensorData) {
    return res.status(400).json({ error: 'Missing sensorData in request body' });
  }

  // Calculate total vehicles for all directions
  const vehicleCounts = roundRobinOrder.map(dir => sensorData[dir]?.vehicles || 0);
  const maxVehicles = Math.max(...vehicleCounts);
  const minVehicles = Math.min(...vehicleCounts);

  // Determine if any direction has much higher congestion (e.g., 2x others)
  let priorityDir = null;
  for (let i = 0; i < roundRobinOrder.length; i++) {
    if (vehicleCounts[i] >= 2 * (minVehicles + 1)) {
      priorityDir = roundRobinOrder[i];
      break;
    }
  }

  // Round-robin: move to next junction unless priority
  let selectedDir;
  if (priorityDir) {
    selectedDir = priorityDir;
    // Optionally, reset round-robin to this direction
    currentIndex = roundRobinOrder.indexOf(priorityDir);
  } else {
    selectedDir = roundRobinOrder[currentIndex];
    currentIndex = (currentIndex + 1) % roundRobinOrder.length;
  }

  // Calculate green time: base + extra (capped)
  const baseTime = 10; // seconds
  const maxExtra = 10; // seconds
  const extraTime = Math.min(sensorData[selectedDir]?.vehicles || 0, maxExtra);
  const greenTime = baseTime + extraTime;
  lastGreenTimes[selectedDir] = greenTime;

  // If there are cyclists in the selected direction, give blue light
  let command;
  if (sensorData[selectedDir]?.cyclists > 0) {
    const initial = selectedDir.charAt(0).toUpperCase();
    command = `${initial}:BLUE`;
  } else {
    const initial = selectedDir.charAt(0).toUpperCase();
    command = `${initial}:GREEN`;
  }

  // Add to command history
  const commandData = {
    id: `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    junction: selectedDir,
    command,
    priority: priorityDir ? 'priority' : 'auto',
    greenTime,
    timestamp: new Date(),
    status: 'sent',
    arduinoPhone: null
  };
  commandHistory.unshift(commandData);
  if (commandHistory.length > 100) {
    commandHistory = commandHistory.slice(0, 100);
  }
  res.json({ success: true, command: commandData, roundRobin: selectedDir, greenTime });
});

module.exports = router; 