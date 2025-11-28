#!/usr/bin/env node

/**
 * Firebase Setup Script for RoadWise TMS
 * This script helps you configure Firebase for the project
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 RoadWise TMS Firebase Setup');
console.log('================================\n');

console.log('📋 Follow these steps to set up Firebase:\n');

console.log('1. 🌐 Go to Firebase Console:');
console.log('   https://console.firebase.google.com/\n');

console.log('2. 🔧 Create a new project:');
console.log('   - Click "Create a project"');
console.log('   - Name it: roadwise-tms');
console.log('   - Enable Google Analytics (optional)');
console.log('   - Click "Create project"\n');

console.log('3. 🔐 Enable Authentication:');
console.log('   - Go to "Authentication" in the sidebar');
console.log('   - Click "Get started"');
console.log('   - Go to "Sign-in method" tab');
console.log('   - Enable "Email/Password"');
console.log('   - Click "Save"\n');

console.log('4. 📊 Create Firestore Database:');
console.log('   - Go to "Firestore Database" in the sidebar');
console.log('   - Click "Create database"');
console.log('   - Choose "Start in production mode"');
console.log('   - Select a location (choose closest to your users)');
console.log('   - Click "Done"\n');

console.log('5. 🌐 Add Web App:');
console.log('   - Click the gear icon → "Project settings"');
console.log('   - Scroll down to "Your apps" section');
console.log('   - Click the web icon (</>)');
console.log('   - Enter app nickname: roadwise-tms-web');
console.log('   - Click "Register app"');
console.log('   - Copy the Firebase config object\n');

console.log('6. 📝 Create .env file:');
console.log('   Create a file named ".env" in the project root with:');
console.log('   VITE_FIREBASE_API_KEY=your-api-key');
console.log('   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com');
console.log('   VITE_FIREBASE_PROJECT_ID=your-project-id');
console.log('   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com');
console.log('   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id');
console.log('   VITE_FIREBASE_APP_ID=your-app-id\n');

console.log('7. 🔒 Configure Security Rules:');
console.log('   - Go to "Firestore Database" → "Rules"');
console.log('   - Replace the default rules with the ones from FIREBASE_FRONTEND_SETUP.md');
console.log('   - Click "Publish"\n');

console.log('8. 📈 Create Indexes:');
console.log('   - Go to "Firestore Database" → "Indexes"');
console.log('   - Create the composite indexes listed in FIREBASE_FRONTEND_SETUP.md\n');

console.log('9. 🚀 Test the Setup:');
console.log('   - Run: npm run dev');
console.log('   - Check browser console for Firebase connection');
console.log('   - Try creating an officer account\n');

console.log('📖 For detailed instructions, see: FIREBASE_FRONTEND_SETUP.md\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file found!');
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('your-api-key')) {
    console.log('⚠️  .env file contains placeholder values. Please update with your actual Firebase config.');
  } else {
    console.log('✅ .env file appears to be configured with real values.');
  }
} else {
  console.log('❌ .env file not found. Please create one with your Firebase configuration.');
}

console.log('\n🎉 Setup complete! Your RoadWise TMS is ready for Firebase integration.'); 