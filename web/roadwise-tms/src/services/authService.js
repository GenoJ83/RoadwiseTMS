import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, collections, USER_ROLES } from './firebase';

// Authentication service with Firebase
export const authService = {
  // Registering new user
  async register(email, password, userData) {
    try {
      console.log('📝 Registration attempt for:', email);
      console.log('📝 User data:', userData);
      
      // Checking if Firebase is properly initialized
      if (!auth || !db) {
        throw new Error('Firebase not properly initialized');
      }
      
      console.log('✅ Firebase auth and db are available');
      
      // Using Firebase authentication
      console.log('🔥 Creating Firebase auth user...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('✅ Firebase auth user created:', user.uid);

      // Updating profile with display name
      console.log('👤 Updating user profile...');
      await updateProfile(user, {
        displayName: `${userData.firstName} ${userData.lastName}`
      });
      console.log('✅ User profile updated');

      // Creating user document in Firestore
      const userDoc = {
        uid: user.uid,
        email: user.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber || '',
        role: userData.role || USER_ROLES.USER,
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
      console.log('📄 Document data:', userDoc);
      console.log('📄 Collection:', collections.USERS);
      console.log('📄 Document ID:', user.uid);
      
      await setDoc(doc(db, collections.USERS, user.uid), userDoc);
      console.log('✅ Firestore document created successfully');

      const result = {
        user: user,
        userData: userDoc
      };
      
      console.log('✅ Registration successful for:', email);
      console.log('✅ Final result:', result);

      return result;
    } catch (error) {
      console.error('❌ Registration error:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      
      // Providing user-friendly error messages
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email already exists.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password should be at least 6 characters long.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address format.');
      } else if (error.code === 'permission-denied') {
        throw new Error('Database access denied. Please check Firebase rules.');
      } else {
        throw new Error(`Registration failed: ${error.message}`);
      }
    }
  },

  // Login user
  async login(email, password) {
    try {
      console.log('🔐 AuthService: Login attempt for:', email);
      
      // Using Firebase authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Getting user data from Firestore
      const userDoc = await getDoc(doc(db, collections.USERS, user.uid));
      
      if (userDoc.exists()) {
        // Updating last login
        await setDoc(doc(db, collections.USERS, user.uid), {
          lastLogin: new Date()
        }, { merge: true });

        const result = {
          user: user,
          userData: { id: userDoc.id, ...userDoc.data() }
        };
        console.log('✅ Firebase login successful:', result);
        return result;
      } else {
        throw new Error('User profile not found. Please contact support.');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      
      // Providing user-friendly error messages
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email address.');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password. Please try again.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address format.');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many failed attempts. Please try again later.');
      } else if (error.code === 'auth/user-disabled') {
        throw new Error('This account has been disabled.');
      } else {
        throw new Error('Login failed. Please check your credentials and try again.');
      }
    }
  },

  // Logging out user
  async logout() {
    try {
      await signOut(auth);
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  // Getting current user
  getCurrentUser() {
    return auth.currentUser;
  },

  // Listening to auth state changes
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Getting user data from Firestore
          const userDoc = await getDoc(doc(db, collections.USERS, user.uid));
          if (userDoc.exists()) {
            callback({
              user: user,
              userData: { id: userDoc.id, ...userDoc.data() }
            });
          } else {
            callback({ user: user, userData: null });
          }
        } catch (error) {
          console.error('Error getting user data:', error);
          callback({ user: user, userData: null });
        }
      } else {
        callback(null);
      }
    });
  },

  // Resetting password
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log(`Password reset email sent to ${email}`);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  },

  // Updating user profile
  async updateUserProfile(userId, updateData) {
    try {
      await setDoc(doc(db, collections.USERS, userId), {
        ...updateData,
        updatedAt: new Date()
      }, { merge: true });
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  },

  // Checking if user is officer
  isOfficer(userData) {
    return userData && userData.role === USER_ROLES.OFFICER;
  },

  // Checking if user is authenticated
  isAuthenticated() {
    return !!auth.currentUser;
  }
};

// Auth context hook (for React components)
export const useAuth = () => {
  return {
    currentUser: auth.currentUser,
    isAuthenticated: !!auth.currentUser,
    login: authService.login,
    register: authService.register,
    logout: authService.logout,
    resetPassword: authService.resetPassword
  };
};

export default authService; 