import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function testUserLogin(email, password) {
  try {
    console.log(`🧪 Testing login for: ${email}`);
    
    // Try to sign in
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('✅ Firebase authentication successful');
    console.log('📧 User email:', user.email);
    console.log('🆔 User UID:', user.uid);
    
    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('✅ User document found in Firestore');
      console.log('📄 User data:', userData);
      console.log('👤 User role:', userData.role);
      console.log('📝 First name:', userData.firstName);
      console.log('📝 Last name:', userData.lastName);
    } else {
      console.log('❌ User document not found in Firestore');
    }
    
    return { success: true, user, userData: userDoc.exists() ? userDoc.data() : null };
  } catch (error) {
    console.error('❌ Login failed:', error.code, error.message);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🧪 Testing RoadWise TMS User Authentication...\n');
  
  // Test credentials
  const testUsers = [
    { email: 'user@roadwise.com', password: 'password123', type: 'Regular User' },
    { email: 'officer@roadwise.com', password: 'password123', type: 'Traffic Officer' },
    { email: 'john.doe@example.com', password: 'password123', type: 'Test User' },
    { email: 'jane.smith@example.com', password: 'password123', type: 'Test Officer' }
  ];
  
  for (const testUser of testUsers) {
    console.log(`\n🔍 Testing ${testUser.type}: ${testUser.email}`);
    console.log('='.repeat(50));
    
    const result = await testUserLogin(testUser.email, testUser.password);
    
    if (result.success) {
      console.log(`✅ ${testUser.type} login successful`);
      if (result.userData) {
        console.log(`✅ User role: ${result.userData.role}`);
      }
    } else {
      console.log(`❌ ${testUser.type} login failed: ${result.error}`);
    }
  }
  
  console.log('\n🧪 Test completed!');
}

main().catch(console.error); 