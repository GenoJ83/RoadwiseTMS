// Initialize Firebase Users Script
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

console.log('🚀 Starting RoadWise TMS user initialization...');

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('✅ Firebase initialized');

// Sample users data
const sampleUsers = [
  {
    uid: 'officer_demo_001',
    email: 'officer@roadwise.com',
    firstName: 'John',
    lastName: 'Officer',
    role: 'officer',
    department: 'Traffic Control',
    badgeNumber: 'TC001',
    phoneNumber: '+256-781-642869',
    createdAt: new Date(),
    lastLogin: new Date(),
    isActive: true,
    profile: {
      department: 'Traffic Control',
      badgeNumber: 'TC001',
      licensePlate: ''
    },
    preferences: {
      notifications: true,
      language: 'en',
      theme: 'light'
    }
  },
  {
    uid: 'user_demo_001',
    email: 'user@roadwise.com',
    firstName: 'Jane',
    lastName: 'User',
    role: 'user',
    licensePlate: 'UGA123A',
    phoneNumber: '+256-781-642869',
    createdAt: new Date(),
    lastLogin: new Date(),
    isActive: true,
    profile: {
      department: '',
      badgeNumber: '',
      licensePlate: 'UGA123A'
    },
    preferences: {
      notifications: true,
      language: 'en',
      theme: 'light'
    }
  },
  {
    uid: 'officer_real_001',
    email: 'traffic.officer@kampala.gov.ug',
    firstName: 'Sarah',
    lastName: 'Nakimera',
    role: 'officer',
    department: 'Traffic Management',
    badgeNumber: 'TC002',
    phoneNumber: '+256-781-642870',
    createdAt: new Date(),
    lastLogin: new Date(),
    isActive: true,
    profile: {
      department: 'Traffic Management',
      badgeNumber: 'TC002',
      licensePlate: ''
    },
    preferences: {
      notifications: true,
      language: 'en',
      theme: 'light'
    }
  },
  {
    uid: 'user_real_001',
    email: 'driver@example.com',
    firstName: 'Michael',
    lastName: 'Ochieng',
    role: 'user',
    licensePlate: 'UGA456B',
    phoneNumber: '+256-781-642871',
    createdAt: new Date(),
    lastLogin: new Date(),
    isActive: true,
    profile: {
      department: '',
      badgeNumber: '',
      licensePlate: 'UGA456B'
    },
    preferences: {
      notifications: true,
      language: 'en',
      theme: 'light'
    }
  }
];

// Initialize users
async function initializeUsers() {
  try {
    console.log('👥 Adding user data...');
    
    for (const userData of sampleUsers) {
      await setDoc(doc(db, 'users', userData.uid), userData);
      console.log(`✅ Added user: ${userData.email} (${userData.role})`);
    }
    
    console.log('🎉 User initialization completed successfully!');
    console.log('📋 Sample users include:');
    console.log('   - Demo Officer: officer@roadwise.com');
    console.log('   - Demo User: user@roadwise.com');
    console.log('   - Real Officer: traffic.officer@kampala.gov.ug');
    console.log('   - Real User: driver@example.com');
    console.log('');
    console.log('🔐 Note: You need to create these users in Firebase Authentication manually');
    console.log('   or use the registration form in the application.');
    
  } catch (error) {
    console.error('❌ Error initializing users:', error);
  }
}

// Run the initialization
initializeUsers(); 