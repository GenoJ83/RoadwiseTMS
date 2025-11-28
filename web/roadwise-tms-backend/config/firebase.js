const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
let app, db, auth;

try {
  // Check if Firebase app is already initialized
  if (!admin.apps.length) {
    app = admin.initializeApp({
      credential: admin.credential.cert({
        type: process.env.FIREBASE_TYPE,
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
  } else {
    app = admin.app();
  }

  db = admin.firestore();
  auth = admin.auth();

  console.log('✅ Firebase Admin SDK initialized successfully');
  console.log('📊 Project ID:', process.env.FIREBASE_PROJECT_ID);
  console.log('🔐 Client Email:', process.env.FIREBASE_CLIENT_EMAIL);

} catch (error) {
  console.error('❌ Firebase Admin SDK initialization failed:', error);
  
  // Fallback to mock configuration if Firebase fails
  console.log('🔄 Falling back to mock Firebase configuration');
  
  const mockDb = {
    collection: (name) => ({
      doc: (id) => ({
        set: async (data) => {
          console.log(`Mock Firestore: Setting ${name}/${id}`, data);
          return Promise.resolve();
        },
        update: async (data) => {
          console.log(`Mock Firestore: Updating ${name}/${id}`, data);
          return Promise.resolve();
        },
        get: async () => ({
          exists: false,
          data: () => ({ location: { latitude: 12.345678, longitude: 98.765432 } })
        })
      })
    })
  };

  const mockAuth = {
    // Mock auth methods
  };

  module.exports = { 
    admin: null, 
    db: mockDb, 
    auth: mockAuth 
  };
  
  return;
}

module.exports = { 
  admin, 
  db, 
  auth 
}; 