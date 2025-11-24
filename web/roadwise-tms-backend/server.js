const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/sms', require('./routes/sms'));
app.use('/api/command', require('./routes/command'));
app.use('/api/predict', require('./routes/predict'));

// --- Traffic State Machine ---
const directions = ['north', 'east', 'south'];
const phases = ['GREEN', 'ORANGE', 'RED', 'BLUE'];
let trafficState = {
  direction: 'north',
  phase: 'GREEN',
  countdown: 30,
  lastUpdate: new Date(),
  override: null, // {direction, phase, countdown}
};
let stateTimer = null;

function getAdaptiveGreenTime(direction) {
  //Integrate real sensor data for adaptive timing
  return 30; // Default 30s 
}

function nextDirection(current) {
  const idx = directions.indexOf(current);
  return directions[(idx + 1) % directions.length];
}

function advanceState() {
  if (trafficState.override) {
    // If override is set,use it once and clear
    trafficState = {
      ...trafficState,
      ...trafficState.override,
      override: null,
      lastUpdate: new Date(),
    };
  } else {
    // Normal state machine
    if (trafficState.phase === 'GREEN' || trafficState.phase === 'BLUE') {
      trafficState = {
        ...trafficState,
        phase: 'ORANGE',
        countdown: 10,
        lastUpdate: new Date(),
      };
    } else if (trafficState.phase === 'ORANGE') {
      trafficState = {
        ...trafficState,
        phase: 'RED',
        countdown: 2,
        lastUpdate: new Date(),
      };
    } else if (trafficState.phase === 'RED') {
      // Move to next direction, decide if BLUE (cyclist) or GREEN
      const nextDir = nextDirection(trafficState.direction);
      // Use sensor data to decide BLUE or GREEN
      trafficState = {
        ...trafficState,
        direction: nextDir,
        phase: 'GREEN',
        countdown: getAdaptiveGreenTime(nextDir),
        lastUpdate: new Date(),
      };
    }
  }
  scheduleNextState();
}

function scheduleNextState() {
  if (stateTimer) clearTimeout(stateTimer);
  stateTimer = setTimeout(advanceState, trafficState.countdown * 1000);
}

// Starting the state machine
scheduleNextState();

// --- API Endpoints ---
app.get('/api/traffic/state', (req, res) => {
  res.json(trafficState);
});

app.post('/api/traffic/override', (req, res) => {
  const { direction, phase, countdown } = req.body;
  if (!direction || !phase || !countdown) {
    return res.status(400).json({ error: 'Missing direction, phase, or countdown' });
  }
  trafficState.override = { direction, phase, countdown };
  res.json({ success: true, override: trafficState.override });
});

// API Health check endpoint (for proxy)
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'RoadWise TMS Backend API is running' });
});

// Health check endpoint (root level)
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'RoadWise TMS Backend is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`RoadWise TMS Backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app; 