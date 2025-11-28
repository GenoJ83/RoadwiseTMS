// Testing Firebase Connectivity
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

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

console.log('🧪 Testing Firebase connectivity...');

// Initializing Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log('✅ Firebase initialized');
console.log('📊 Project ID:', firebaseConfig.projectId);

// Testing Firestore write
async function testFirestore() {
  try {
    console.log('📝 Testing Firestore write...');
    
    const testData = {
      test: true,
      timestamp: new Date(),
      message: 'Firebase connectivity test'
    };
    
    await setDoc(doc(db, 'test', 'connectivity'), testData);
    console.log('✅ Firestore write successful');
    
    // Testing Firestore read
    console.log('📖 Testing Firestore read...');
    const docSnap = await getDoc(doc(db, 'test', 'connectivity'));
    
    if (docSnap.exists()) {
      console.log('✅ Firestore read successful');
      console.log('📄 Document data:', docSnap.data());
    } else {
      console.log('❌ Document not found');
    }
    
  } catch (error) {
    console.error('❌ Firestore test failed:', error);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error message:', error.message);
  }
}

// Running the test
testFirestore(); 