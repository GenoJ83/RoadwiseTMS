// Database Initialization Script for RoadWise TMS
// Run this script after setting up Firebase to populate sample data

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Firebase configuration - Updated with actual config
const firebaseConfig = {
  apiKey: "AIzaSyDlFUFjlY7f_vl7Y-mif6o7yLRFnWpvmrM",
  authDomain: "roadwise-tms.firebaseapp.com",
  projectId: "roadwise-tms",
  storageBucket: "roadwise-tms.firebasestorage.app",
  messagingSenderId: "212769752315",
  appId: "1:212769752315:web:70677465ff62ee951bdc5e",
  measurementId: "G-TQW7B66HGD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample traffic data for initialization
const sampleTrafficData = {
  north: {
    junctionId: 'north',
    name: 'North Junction - Main Street',
    location: {
      latitude: 0.3476,
      longitude: 32.5825,
      address: 'Main Street & Northern Highway, Kampala'
    },
    currentStatus: {
      flow: 75,
      congestion: 'medium',
      waitTime: 2,
      vehicles: 45,
      cyclists: 8,
      lastUpdated: new Date()
    },
    trafficLights: {
      north: { status: 'green', duration: 30, mode: 'auto' },
      east: { status: 'red', duration: 30, mode: 'auto' },
      south: { status: 'red', duration: 30, mode: 'auto' }
    },
    sensors: {
      vehicleCount: 45,
      cyclistCount: 8,
      pedestrianCount: 12,
      lastUpdated: new Date()
    }
  },
  east: {
    junctionId: 'east',
    name: 'East Junction - Highway',
    location: {
      latitude: 0.3476,
      longitude: 32.5825,
      address: 'Eastern Highway & Industrial Road, Kampala'
    },
    currentStatus: {
      flow: 60,
      congestion: 'low',
      waitTime: 1,
      vehicles: 30,
      cyclists: 5,
      lastUpdated: new Date()
    },
    trafficLights: {
      north: { status: 'red', duration: 30, mode: 'auto' },
      east: { status: 'green', duration: 30, mode: 'auto' },
      south: { status: 'red', duration: 30, mode: 'auto' }
    },
    sensors: {
      vehicleCount: 30,
      cyclistCount: 5,
      pedestrianCount: 8,
      lastUpdated: new Date()
    }
  },
  south: {
    junctionId: 'south',
    name: 'South Junction - Downtown',
    location: {
      latitude: 0.3476,
      longitude: 32.5825,
      address: 'Downtown Avenue & Southern Road, Kampala'
    },
    currentStatus: {
      flow: 90,
      congestion: 'high',
      waitTime: 5,
      vehicles: 60,
      cyclists: 12,
      lastUpdated: new Date()
    },
    trafficLights: {
      north: { status: 'red', duration: 30, mode: 'auto' },
      east: { status: 'red', duration: 30, mode: 'auto' },
      south: { status: 'green', duration: 30, mode: 'auto' }
    },
    sensors: {
      vehicleCount: 60,
      cyclistCount: 12,
      pedestrianCount: 25,
      lastUpdated: new Date()
    }
  }
};

// Sample traffic alerts
const sampleAlerts = [
  {
    alertId: 'alert-001',
    type: 'construction',
    title: 'Road Construction on Main Street',
    message: 'Lane closure on Main Street between 8 AM and 6 PM for road repairs.',
    severity: 'medium',
    location: {
      junctionId: 'north',
      address: 'Main Street, Kampala'
    },
    isActive: true,
    createdBy: 'system',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    alertId: 'alert-002',
    type: 'traffic_jam',
    title: 'Heavy Traffic on Eastern Highway',
    message: 'Expect delays on Eastern Highway due to increased traffic volume.',
    severity: 'high',
    location: {
      junctionId: 'east',
      address: 'Eastern Highway, Kampala'
    },
    isActive: true,
    createdBy: 'system',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Initialize database with sample data
const initializeDatabase = async () => {
  try {
    console.log('🚀 Initializing RoadWise TMS database...');
    console.log('📊 Project: roadwise-tms');

    // Initialize traffic data
    console.log('📊 Setting up traffic data...');
    for (const [junctionId, data] of Object.entries(sampleTrafficData)) {
      await setDoc(doc(db, 'trafficData', junctionId), data);
      console.log(`✅ Traffic data initialized for ${junctionId} junction`);
    }

    // Initialize traffic alerts
    console.log('🚨 Setting up traffic alerts...');
    for (const alert of sampleAlerts) {
      await setDoc(doc(db, 'trafficAlerts', alert.alertId), alert);
      console.log(`✅ Alert initialized: ${alert.title}`);
    }

    console.log('🎉 Database initialization completed successfully!');
    console.log('📋 Sample data includes:');
    console.log('   - 3 traffic junctions (North, East, South)');
    console.log('   - Real-time traffic status');
    console.log('   - Traffic light configurations');
    console.log('   - Sensor data');
    console.log('   - 2 active traffic alerts');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

// Run initialization if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase()
    .then(() => {
      console.log('✅ Database setup complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

export { initializeDatabase }; 