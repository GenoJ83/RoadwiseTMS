import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db, collections, JUNCTIONS, USER_ROLES } from './firebase';

// User Management
export const userService = {
  // Get user by ID
  async getUser(userId) {
    try {
      const userDoc = await getDoc(doc(db, collections.USERS, userId));
      return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  },

  // Creating new user
  async createUser(userData) {
    try {
      const userRef = await addDoc(collection(db, collections.USERS), {
        ...userData,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        isActive: true
      });
      return userRef.id;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Updating user
  async updateUser(userId, updateData) {
    try {
      await updateDoc(doc(db, collections.USERS, userId), {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Getting all officers
  async getOfficers() {
    try {
      const q = query(
        collection(db, collections.USERS),
        where('role', '==', USER_ROLES.OFFICER),
        where('isActive', '==', true)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting officers:', error);
      throw error;
    }
  }
};

// Traffic Data Management
export const trafficService = {
  // Get traffic data for a junction
  async getTrafficData(junctionId) {
    try {
      const trafficDoc = await getDoc(doc(db, collections.TRAFFIC_DATA, junctionId));
      return trafficDoc.exists() ? { id: trafficDoc.id, ...trafficDoc.data() } : null;
    } catch (error) {
      console.error('Error getting traffic data:', error);
      throw error;
    }
  },

  // Getting all traffic data
  async getAllTrafficData() {
    try {
      const querySnapshot = await getDocs(collection(db, collections.TRAFFIC_DATA));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting all traffic data:', error);
      throw error;
    }
  },

  // Updating traffic data
  async updateTrafficData(junctionId, updateData) {
    try {
      await updateDoc(doc(db, collections.TRAFFIC_DATA, junctionId), {
        ...updateData,
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating traffic data:', error);
      throw error;
    }
  },

  // Listening to real-time traffic data
  subscribeToTrafficData(junctionId, callback) {
    return onSnapshot(doc(db, collections.TRAFFIC_DATA, junctionId), (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      } else {
        callback(null);
      }
    });
  }
};

// Traffic Issues Management
export const issueService = {
  // Create new issue
  async createIssue(issueData) {
    try {
      const issueRef = await addDoc(collection(db, collections.TRAFFIC_ISSUES), {
        ...issueData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'reported'
      });
      return issueRef.id;
    } catch (error) {
      console.error('Error creating issue:', error);
      throw error;
    }
  },

  // Getting issues by user
  async getUserIssues(userId) {
    try {
      const q = query(
        collection(db, collections.TRAFFIC_ISSUES),
        where('reporterId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting user issues:', error);
      throw error;
    }
  },

  // Getting all issues (for officers)
  async getAllIssues() {
    try {
      const q = query(
        collection(db, collections.TRAFFIC_ISSUES),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting all issues:', error);
      throw error;
    }
  },

  // Updating issue status
  async updateIssueStatus(issueId, status, officerId, notes = '') {
    try {
      const updateData = {
        status,
        updatedAt: serverTimestamp()
      };

      if (status === 'resolved') {
        updateData.resolution = {
          notes,
          resolvedBy: officerId,
          resolvedAt: serverTimestamp()
        };
      }

      await updateDoc(doc(db, collections.TRAFFIC_ISSUES, issueId), updateData);
    } catch (error) {
      console.error('Error updating issue status:', error);
      throw error;
    }
  }
};

// Traffic Alerts Management
export const alertService = {
  // Creating new alert
  async createAlert(alertData) {
    try {
      const alertRef = await addDoc(collection(db, collections.TRAFFIC_ALERTS), {
        ...alertData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true
      });
      return alertRef.id;
    } catch (error) {
      console.error('Error creating alert:', error);
      throw error;
    }
  },

  // Getting active alerts
  async getActiveAlerts() {
    try {
      const q = query(
        collection(db, collections.TRAFFIC_ALERTS),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting active alerts:', error);
      throw error;
    }
  },

  // Updating alert status
  async updateAlertStatus(alertId, isActive) {
    try {
      await updateDoc(doc(db, collections.TRAFFIC_ALERTS, alertId), {
        isActive,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating alert status:', error);
      throw error;
    }
  }
};

// Route Planning Management
export const routeService = {
  // Creating route plan
  async createRoutePlan(routeData) {
    try {
      const routeRef = await addDoc(collection(db, collections.ROUTE_PLANS), {
        ...routeData,
        createdAt: serverTimestamp(),
        isActive: true
      });
      return routeRef.id;
    } catch (error) {
      console.error('Error creating route plan:', error);
      throw error;
    }
  },

  // Getting user route plans
  async getUserRoutes(userId) {
    try {
      const q = query(
        collection(db, collections.ROUTE_PLANS),
        where('userId', '==', userId),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting user routes:', error);
      throw error;
    }
  }
};

// Optimization History Management
export const optimizationService = {
  // Create optimization record
  async createOptimization(optimizationData) {
    try {
      const optimizationRef = await addDoc(collection(db, collections.OPTIMIZATION_HISTORY), {
        ...optimizationData,
        createdAt: serverTimestamp()
      });
      return optimizationRef.id;
    } catch (error) {
      console.error('Error creating optimization:', error);
      throw error;
    }
  },

  // Getting optimization history
  async getOptimizationHistory(limitCount = 10) {
    try {
      const q = query(
        collection(db, collections.OPTIMIZATION_HISTORY),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting optimization history:', error);
      throw error;
    }
  }
};

// Emergency Events Management
export const emergencyService = {
  // Creating emergency event
  async createEmergencyEvent(eventData) {
    try {
      const eventRef = await addDoc(collection(db, collections.EMERGENCY_EVENTS), {
        ...eventData,
        createdAt: serverTimestamp(),
        status: 'active'
      });
      return eventRef.id;
    } catch (error) {
      console.error('Error creating emergency event:', error);
      throw error;
    }
  },

  // Getting active emergency events
  async getActiveEmergencies() {
    try {
      const q = query(
        collection(db, collections.EMERGENCY_EVENTS),
        where('status', 'in', ['active', 'responding']),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting active emergencies:', error);
      throw error;
    }
  },

  // Updatng emergency status
  async updateEmergencyStatus(eventId, status) {
    try {
      const updateData = {
        status,
        updatedAt: serverTimestamp()
      };

      if (status === 'resolved') {
        updateData.resolvedAt = serverTimestamp();
      }

      await updateDoc(doc(db, collections.EMERGENCY_EVENTS, eventId), updateData);
    } catch (error) {
      console.error('Error updating emergency status:', error);
      throw error;
    }
  }
};

export default {
  userService,
  trafficService,
  issueService,
  alertService,
  routeService,
  optimizationService,
  emergencyService
}; 