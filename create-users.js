import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
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

// Initializing Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createUser(email, password, userData) {
  try {
    console.log(`📝 Creating user: ${email}`);
    
    // Creating user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('✅ Firebase Authentication user created');
    console.log('📧 User email:', user.email);
    console.log('🆔 User UID:', user.uid);
    
    // Creating user document in Firestore
    const userDoc = {
      uid: user.uid,
      email: user.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phoneNumber: userData.phoneNumber || '',
      role: userData.role,
      createdAt: new Date(),
      lastLogin: new Date(),
      isActive: true,
      profile: {
        department: userData.department || '',
        badgeNumber: userData.badgeNumber || '',
        licensePlate: userData.licensePlate || ''
      },
      preferences: {
        notifications: true,
        language: 'en',
        theme: 'light'
      }
    };
    
    console.log('📄 Creating Firestore document...');
    await setDoc(doc(db, 'users', user.uid), userDoc);
    console.log('✅ Firestore document created successfully');
    
    console.log('✅ User creation completed successfully');
    return { success: true, user, userData: userDoc };
  } catch (error) {
    console.error('❌ User creation failed:', error.code, error.message);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🚀 Creating RoadWise TMS Users...\n');
  
  // Users to create
  const usersToCreate = [
    {
      email: 'user@roadwise.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+256-123-456-789',
      role: 'user',
      type: 'Regular User'
    },
    {
      email: 'officer@roadwise.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Smith',
      phoneNumber: '+256-987-654-321',
      role: 'officer',
      department: 'Traffic Control',
      badgeNumber: 'TC001',
      type: 'Traffic Officer'
    },
    {
      email: 'john.doe@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+256-111-222-333',
      role: 'user',
      type: 'Test User'
    },
    {
      email: 'jane.smith@example.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Smith',
      phoneNumber: '+256-444-555-666',
      role: 'officer',
      department: 'Traffic Control',
      badgeNumber: 'TC002',
      type: 'Test Officer'
    }
  ];
  
  for (const userData of usersToCreate) {
    console.log(`\n🔍 Creating ${userData.type}: ${userData.email}`);
    console.log('='.repeat(50));
    
    const result = await createUser(userData.email, userData.password, userData);
    
    if (result.success) {
      console.log(`✅ ${userData.type} created successfully`);
      console.log(`✅ User role: ${result.userData.role}`);
    } else {
      console.log(`❌ ${userData.type} creation failed: ${result.error}`);
    }
  }
  
  console.log('\n🚀 User creation completed!');
  console.log('\n📋 Test Credentials:');
  console.log('Regular User: user@roadwise.com / password123');
  console.log('Traffic Officer: officer@roadwise.com / password123');
  console.log('Test User: john.doe@example.com / password123');
  console.log('Test Officer: jane.smith@example.com / password123');
}

main().catch(console.error); 