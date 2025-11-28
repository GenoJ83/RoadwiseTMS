import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

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

// Initializing Firebase
let app, auth, db, storage, analytics;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  
  // Initializing analytics only if measurementId is available
  if (firebaseConfig.measurementId) {
    analytics = getAnalytics(app);
  }
  
  console.log('✅ Firebase initialized successfully');
  console.log('📊 Project ID:', firebaseConfig.projectId);
  console.log('🔐 Auth Domain:', firebaseConfig.authDomain);
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  throw error;
}

// Exporting Firebase services
export { auth, db, storage, analytics };

// Firestore collections
export const collections = {
  USERS: 'users',
  TRAFFIC_DATA: 'trafficData',
  TRAFFIC_ISSUES: 'trafficIssues',
  TRAFFIC_ALERTS: 'trafficAlerts',
  ROUTE_PLANS: 'routePlans',
  OPTIMIZATION_HISTORY: 'optimizationHistory',
  EMERGENCY_EVENTS: 'emergencyEvents',
  ANALYTICS: 'analytics',
  NOTIFICATIONS: 'notifications',
  SYSTEM_REPORTS: 'systemReports'
};

// Junction IDs
export const JUNCTIONS = {
  NORTH: 'north',
  EAST: 'east',
  SOUTH: 'south'
};

// User roles
export const USER_ROLES = {
  OFFICER: 'officer',
  USER: 'user'
};

// Traffic light statuses
export const TRAFFIC_LIGHT_STATUS = {
  RED: 'red',
  YELLOW: 'yellow',
  GREEN: 'green',
  BLUE: 'blue'
};

// Issue types
export const ISSUE_TYPES = {
  TRAFFIC_JAM: 'traffic_jam',
  ACCIDENT: 'accident',
  CONSTRUCTION: 'construction',
  BROKEN_LIGHT: 'broken_traffic_light',
  ROAD_DAMAGE: 'road_damage',
  FLOODING: 'flooding',
  OTHER: 'other'
};

// Severity levels
export const SEVERITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Traffic congestion levels
export const CONGESTION_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

// Travel modes
export const TRAVEL_MODES = {
  CAR: 'car',
  BICYCLE: 'bicycle',
  MOTORCYCLE: 'motorcycle'
};

// Helper function to check if Firebase is ready
export const isFirebaseReady = () => {
  return app && auth && db;
};

export default app; 