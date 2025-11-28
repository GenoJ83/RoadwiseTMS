// Simple Database Initialization Script for RoadWise TMS
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDlFUFjlY7f_vl7Y-mif6o7yLRFnWpvmrM",
  authDomain: "roadwise-tms.firebaseapp.com",
  projectId: "roadwise-tms",
  storageBucket: "roadwise-tms.firebasestorage.app",
  messagingSenderId: "212769752315",
  appId: "1:212769752315:web:70677465ff62ee951bdc5e",
  measurementId: "G-TQW7B66HGD"
};

console.log('🚀 Starting RoadWise TMS database initialization...');

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('✅ Firebase initialized');

// Sample traffic data
const sampleData = {
  north: {
    junctionId: 'north',
    name: 'North Junction - Main Street',
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

// Initialize database
async function initializeDatabase() {
  try {
    console.log('📊 Adding traffic data...');
    
    for (const [junctionId, data] of Object.entries(sampleData)) {
      await setDoc(doc(db, 'trafficData', junctionId), data);
      console.log(`✅ Added traffic data for ${junctionId} junction`);
    }
    
    console.log('🎉 Database initialization completed successfully!');
    console.log('📋 Sample data includes:');
    console.log('   - 3 traffic junctions (North, East, South)');
    console.log('   - Real-time traffic status');
    console.log('   - Traffic light configurations');
    console.log('   - Sensor data');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  }
}

// Run the initialization
initializeDatabase(); 