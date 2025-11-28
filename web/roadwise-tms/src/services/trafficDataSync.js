import { 
  doc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import { db, collections, JUNCTIONS } from './firebase';

// Traffic Data Synchronization Service
export const trafficDataSync = {
  // Initialize traffic data in Firebase
  async initializeTrafficData() {
    try {
      const initialData = {
        north: {
          vehicles: 15,
          cyclists: 2,
          congestion: 'medium',
          trafficLight: { red: false, orange: false, blue: false, green: true },
          lastUpdated: serverTimestamp(),
          isActive: true
        },
        east: {
          vehicles: 8,
          cyclists: 1,
          congestion: 'low',
          trafficLight: { red: false, orange: true, blue: false, green: false },
          lastUpdated: serverTimestamp(),
          isActive: true
        },
        south: {
          vehicles: 25,
          cyclists: 3,
          congestion: 'high',
          trafficLight: { red: true, orange: false, blue: false, green: false },
          lastUpdated: serverTimestamp(),
          isActive: true
        }
      };

      // Set initial data for each junction
      for (const [junctionId, data] of Object.entries(initialData)) {
        await setDoc(doc(db, collections.TRAFFIC_DATA, junctionId), {
          ...data,
          createdAt: serverTimestamp(),
          junctionId,
          junctionName: this.getJunctionName(junctionId)
        });
      }

      console.log('✅ Traffic data initialized in Firebase');
      return true;
    } catch (error) {
      console.error('❌ Error initializing traffic data:', error);
      throw error;
    }
  },

  // Update sensor data for a specific junction
  async updateSensorData(junctionId, sensorData) {
    try {
      const updateData = {
        vehicles: sensorData.vehicles,
        cyclists: sensorData.cyclists,
        congestion: sensorData.congestion,
        lastUpdated: serverTimestamp(),
        isActive: true
      };

      await updateDoc(doc(db, collections.TRAFFIC_DATA, junctionId), updateData);
      
      console.log(`📊 [${new Date().toLocaleTimeString()}] Updated sensor data for ${junctionId} junction:`, updateData);
      return true;
    } catch (error) {
      console.error(`❌ [${new Date().toLocaleTimeString()}] Error updating sensor data for ${junctionId}:`, error);
      throw error;
    }
  },

  // Update traffic light state for a specific junction
  async updateTrafficLightState(junctionId, trafficLightState) {
    try {
      const updateData = {
        trafficLight: trafficLightState,
        lastUpdated: serverTimestamp(),
        isActive: true
      };

      await updateDoc(doc(db, collections.TRAFFIC_DATA, junctionId), updateData);
      
      console.log(`🚦 [${new Date().toLocaleTimeString()}] Updated traffic light state for ${junctionId} junction:`, updateData);
      return true;
    } catch (error) {
      console.error(`❌ [${new Date().toLocaleTimeString()}] Error updating traffic light state for ${junctionId}:`, error);
      throw error;
    }
  },

  // Update complete traffic state (sensor data + traffic lights)
  async updateCompleteTrafficState(junctionId, sensorData, trafficLightState) {
    try {
      const updateData = {
        vehicles: sensorData.vehicles,
        cyclists: sensorData.cyclists,
        congestion: sensorData.congestion,
        trafficLight: trafficLightState,
        lastUpdated: serverTimestamp(),
        isActive: true
      };

      await updateDoc(doc(db, collections.TRAFFIC_DATA, junctionId), updateData);
      
      console.log(`🔄 [${new Date().toLocaleTimeString()}] Updated complete traffic state for ${junctionId} junction:`, updateData);
      return true;
    } catch (error) {
      console.error(`❌ [${new Date().toLocaleTimeString()}] Error updating complete traffic state for ${junctionId}:`, error);
      throw error;
    }
  },

  // Update system mode and phase information
  async updateSystemMode(systemData) {
    try {
      const updateData = {
        currentPhase: systemData.currentPhase,
        nextPhase: systemData.nextPhase,
        phaseTimer: systemData.phaseTimer,
        isAutomaticMode: systemData.isAutomaticMode,
        cyclistPriority: systemData.cyclistPriority,
        cyclistTimer: systemData.cyclistTimer,
        priorityMode: systemData.priorityMode,
        priorityDirection: systemData.priorityDirection,
        lastUpdated: serverTimestamp()
      };

      // Update system data in a separate document
      await setDoc(doc(db, collections.TRAFFIC_DATA, 'system'), updateData);
      
      console.log(`🤖 [${new Date().toLocaleTimeString()}] Updated system mode data:`, updateData);
      return true;
    } catch (error) {
      console.error(`❌ [${new Date().toLocaleTimeString()}] Error updating system mode:`, error);
      throw error;
    }
  },

  // Log traffic event (phase changes, mode switches, etc.)
  async logTrafficEvent(eventData) {
    try {
      const eventDoc = {
        ...eventData,
        timestamp: serverTimestamp(),
        eventId: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      await addDoc(collection(db, collections.ANALYTICS), eventDoc);
      
      console.log(`📝 [${new Date().toLocaleTimeString()}] Logged traffic event:`, eventDoc);
      return true;
    } catch (error) {
      console.error(`❌ [${new Date().toLocaleTimeString()}] Error logging traffic event:`, error);
      throw error;
    }
  },

  // Get junction name from ID
  getJunctionName(junctionId) {
    const junctionNames = {
      north: 'North Junction - Main Street',
      east: 'East Junction - Highway Exit',
      south: 'South Junction - City Center'
    };
    return junctionNames[junctionId] || junctionId;
  },

  // Batch update all junctions
  async batchUpdateAllJunctions(trafficData) {
    try {
      const updatePromises = Object.entries(trafficData.sensorData).map(([junctionId, sensorData]) => {
        const trafficLightState = trafficData.trafficLights[junctionId];
        return this.updateCompleteTrafficState(junctionId, sensorData, trafficLightState);
      });

      await Promise.all(updatePromises);
      
      // Update system mode
      await this.updateSystemMode({
        currentPhase: trafficData.currentPhase,
        nextPhase: trafficData.nextPhase,
        phaseTimer: trafficData.phaseTimer,
        isAutomaticMode: trafficData.isAutomaticMode,
        cyclistPriority: trafficData.cyclistPriority,
        cyclistTimer: trafficData.cyclistTimer,
        priorityMode: trafficData.priorityMode,
        priorityDirection: trafficData.priorityDirection
      });

      console.log('✅ Batch update completed for all junctions');
      return true;
    } catch (error) {
      console.error('❌ Error in batch update:', error);
      throw error;
    }
  },

  // Get recent traffic events
  async getRecentTrafficEvents(limitCount = 50) {
    try {
      const q = query(
        collection(db, collections.ANALYTICS),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('❌ Error getting recent traffic events:', error);
      throw error;
    }
  },

  // Check if Firebase is ready
  isReady() {
    return db !== null;
  },

  // Test Firebase connectivity
  async testConnection() {
    try {
      console.log('🧪 Testing Firebase connection...');
      
      // Try to write a test document
      const testDoc = {
        test: true,
        timestamp: serverTimestamp(),
        message: 'Firebase connection test'
      };
      
      await setDoc(doc(db, 'test', 'connection-test'), testDoc);
      console.log('✅ Firebase connection test successful');
      
      // Clean up test document
      await deleteDoc(doc(db, 'test', 'connection-test'));
      console.log('🧹 Test document cleaned up');
      
      return true;
    } catch (error) {
      console.error('❌ Firebase connection test failed:', error);
      return false;
    }
  },

  // Get connection status
  getConnectionStatus() {
    return {
      isReady: this.isReady(),
      db: db ? 'Connected' : 'Not connected',
      collections: collections,
      timestamp: new Date().toISOString()
    };
  }
};

// Auto-sync configuration
export const autoSyncConfig = {
  // Sync intervals (in milliseconds)
  SENSOR_DATA_SYNC_INTERVAL: 5000, // 5 seconds
  TRAFFIC_LIGHT_SYNC_INTERVAL: 2000, // 2 seconds
  SYSTEM_MODE_SYNC_INTERVAL: 10000, // 10 seconds
  EVENT_LOG_INTERVAL: 30000, // 30 seconds
  
  // Enable/disable auto-sync
  ENABLE_AUTO_SYNC: true,
  ENABLE_EVENT_LOGGING: true,
  
  // Retry configuration
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000 // 1 second
};

export default trafficDataSync; 