import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { trafficDataSync, autoSyncConfig } from '../services/trafficDataSync';
import { trafficStateService } from '../services/apiService';

// Creating Traffic Data Context
const TrafficDataContext = createContext();

// Traffic Data Provider Component
export const TrafficDataProvider = ({ children }) => {
  // Shared traffic data state
  const [sensorData, setSensorData] = useState({
    north: { vehicles: 15, cyclists: 2, congestion: 'medium' },
    east: { vehicles: 8, cyclists: 1, congestion: 'low' },
    south: { vehicles: 25, cyclists: 3, congestion: 'high' }
  });

  const [trafficLights, setTrafficLights] = useState({
    north: { red: false, orange: false, blue: false, green: true },
    east: { red: false, orange: true, blue: false, green: false },
    south: { red: true, orange: false, blue: false, green: false }
  });

  const [currentPhase, setCurrentPhase] = useState('north');
  const [nextPhase, setNextPhase] = useState('east');
  const [phaseTimer, setPhaseTimer] = useState(30);
  const [isAutomaticMode, setIsAutomaticMode] = useState(true);
  const [cyclistPriority, setCyclistPriority] = useState(null);
  const [cyclistTimer, setCyclistTimer] = useState(0);
  const [priorityMode, setPriorityMode] = useState(false);
  const [priorityDirection, setPriorityDirection] = useState(null);
  const [phaseCountdown, setPhaseCountdown] = useState(0);
  const [phaseType, setPhaseType] = useState('GREEN');

  // Firebase sync state
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState('initializing');
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncError, setSyncError] = useState(null);

  // Refs for intervals
  const sensorSyncIntervalRef = useRef(null);
  const trafficLightSyncIntervalRef = useRef(null);
  const systemModeSyncIntervalRef = useRef(null);
  const eventLogIntervalRef = useRef(null);

  // Backend traffic state
  const [backendTrafficState, setBackendTrafficState] = useState({
    direction: 'north',
    phase: 'GREEN',
    countdown: 30,
    lastUpdate: new Date(),
  });

  // Initialize Firebase sync
  useEffect(() => {
    const initializeFirebaseSync = async () => {
      try {
        console.log('🚀 Initializing Firebase sync...');
        
        if (trafficDataSync.isReady()) {
          setIsFirebaseReady(true);
          setSyncStatus('initializing');
          
          // Test Firebase connection
          console.log('🧪 Testing Firebase connection...');
          const connectionTest = await trafficDataSync.testConnection();
          
          if (!connectionTest) {
            throw new Error('Firebase connection test failed');
          }
          
          console.log('✅ Firebase connection test passed');
          
          // Initialize traffic data in Firebase
          console.log('📊 Initializing traffic data in Firebase...');
          await trafficDataSync.initializeTrafficData();
          
          setSyncStatus('ready');
          setLastSyncTime(new Date());
          console.log('✅ Firebase sync initialized successfully');
          
          // Start auto-sync if enabled
          if (autoSyncConfig.ENABLE_AUTO_SYNC) {
            console.log('🔄 Starting automatic sync...');
            startAutoSync();
          }
        } else {
          setSyncStatus('error');
          setSyncError('Firebase not ready');
          console.error('❌ Firebase not ready for sync');
        }
      } catch (error) {
        setSyncStatus('error');
        setSyncError(error.message);
        console.error('❌ Error initializing Firebase sync:', error);
      }
    };

    // Add a small delay to ensure Firebase is fully initialized
    const timer = setTimeout(() => {
      initializeFirebaseSync();
    }, 1000);

    return () => {
      clearTimeout(timer);
      stopAutoSync();
    };
  }, []);

  // Start automatic synchronization
  const startAutoSync = () => {
    if (!autoSyncConfig.ENABLE_AUTO_SYNC) return;

    console.log('🔄 Starting automatic Firebase sync...');

    // Sensor data sync (every 5 seconds)
    sensorSyncIntervalRef.current = setInterval(async () => {
      try {
        await syncSensorData();
      } catch (error) {
        console.error('❌ Sensor data sync error:', error);
      }
    }, autoSyncConfig.SENSOR_DATA_SYNC_INTERVAL);

    // Traffic light sync (every 2 seconds)
    trafficLightSyncIntervalRef.current = setInterval(async () => {
      try {
        await syncTrafficLights();
      } catch (error) {
        console.error('❌ Traffic light sync error:', error);
      }
    }, autoSyncConfig.TRAFFIC_LIGHT_SYNC_INTERVAL);

    // System mode sync (every 10 seconds)
    systemModeSyncIntervalRef.current = setInterval(async () => {
      try {
        await syncSystemMode();
      } catch (error) {
        console.error('❌ System mode sync error:', error);
      }
    }, autoSyncConfig.SYSTEM_MODE_SYNC_INTERVAL);

    // Event logging (every 30 seconds)
    if (autoSyncConfig.ENABLE_EVENT_LOGGING) {
      eventLogIntervalRef.current = setInterval(async () => {
        try {
          await logSystemEvent();
        } catch (error) {
          console.error('❌ Event logging error:', error);
        }
      }, autoSyncConfig.EVENT_LOG_INTERVAL);
    }

    console.log('✅ Auto-sync started successfully');
  };

  // Stop automatic synchronization
  const stopAutoSync = () => {
    console.log('🛑 Stopping automatic Firebase sync...');

    if (sensorSyncIntervalRef.current) {
      clearInterval(sensorSyncIntervalRef.current);
      sensorSyncIntervalRef.current = null;
    }

    if (trafficLightSyncIntervalRef.current) {
      clearInterval(trafficLightSyncIntervalRef.current);
      trafficLightSyncIntervalRef.current = null;
    }

    if (systemModeSyncIntervalRef.current) {
      clearInterval(systemModeSyncIntervalRef.current);
      systemModeSyncIntervalRef.current = null;
    }

    if (eventLogIntervalRef.current) {
      clearInterval(eventLogIntervalRef.current);
      eventLogIntervalRef.current = null;
    }

    console.log('✅ Auto-sync stopped');
  };

  // Sync sensor data to Firebase
  const syncSensorData = async () => {
    if (!isFirebaseReady) {
      console.log('⚠️ Firebase not ready for sensor data sync');
      return;
    }

    try {
      console.log(`🔄 [${new Date().toLocaleTimeString()}] Starting sensor data sync...`);
      const updatePromises = Object.entries(sensorData).map(([junctionId, data]) =>
        trafficDataSync.updateSensorData(junctionId, data)
      );

      await Promise.all(updatePromises);
      setLastSyncTime(new Date());
      setSyncStatus('synced');
      console.log(`✅ [${new Date().toLocaleTimeString()}] Sensor data sync completed successfully`);
    } catch (error) {
      setSyncStatus('error');
      setSyncError(error.message);
      console.error(`❌ [${new Date().toLocaleTimeString()}] Sensor data sync error:`, error);
      throw error;
    }
  };

  // Sync traffic lights to Firebase
  const syncTrafficLights = async () => {
    if (!isFirebaseReady) {
      console.log('⚠️ Firebase not ready for traffic light sync');
      return;
    }

    try {
      console.log(`🔄 [${new Date().toLocaleTimeString()}] Starting traffic light sync...`);
      const updatePromises = Object.entries(trafficLights).map(([junctionId, lights]) =>
        trafficDataSync.updateTrafficLightState(junctionId, lights)
      );

      await Promise.all(updatePromises);
      setLastSyncTime(new Date());
      console.log(`✅ [${new Date().toLocaleTimeString()}] Traffic light sync completed successfully`);
    } catch (error) {
      console.error(`❌ [${new Date().toLocaleTimeString()}] Traffic light sync error:`, error);
      throw error;
    }
  };

  // Sync system mode to Firebase
  const syncSystemMode = async () => {
    if (!isFirebaseReady) {
      console.log('⚠️ Firebase not ready for system mode sync');
      return;
    }

    try {
      console.log(`🔄 [${new Date().toLocaleTimeString()}] Starting system mode sync...`);
      await trafficDataSync.updateSystemMode({
        currentPhase,
        nextPhase,
        phaseTimer,
        isAutomaticMode,
        cyclistPriority,
        cyclistTimer,
        priorityMode,
        priorityDirection
      });
      setLastSyncTime(new Date());
      console.log(`✅ [${new Date().toLocaleTimeString()}] System mode sync completed successfully`);
    } catch (error) {
      console.error(`❌ [${new Date().toLocaleTimeString()}] System mode sync error:`, error);
      throw error;
    }
  };

  // Log system event to Firebase
  const logSystemEvent = async () => {
    if (!isFirebaseReady || !autoSyncConfig.ENABLE_EVENT_LOGGING) {
      console.log('⚠️ Firebase not ready or event logging disabled');
      return;
    }

    try {
      console.log(`🔄 [${new Date().toLocaleTimeString()}] Logging system event...`);
      const eventData = {
        type: 'system_status',
        data: {
          currentPhase,
          nextPhase,
          phaseTimer,
          isAutomaticMode,
          cyclistPriority,
          priorityMode,
          priorityDirection,
          sensorData,
          trafficLights
        },
        timestamp: new Date().toISOString()
      };

      await trafficDataSync.logTrafficEvent(eventData);
      console.log(`✅ [${new Date().toLocaleTimeString()}] System event logged successfully`);
    } catch (error) {
      console.error(`❌ [${new Date().toLocaleTimeString()}] Event logging error:`, error);
      throw error;
    }
  };

  // Manual sync function
  const manualSync = async () => {
    try {
      setSyncStatus('syncing');
      
      await trafficDataSync.batchUpdateAllJunctions({
        sensorData,
        trafficLights,
        currentPhase,
        nextPhase,
        phaseTimer,
        isAutomaticMode,
        cyclistPriority,
        cyclistTimer,
        priorityMode,
        priorityDirection
      });

      setLastSyncTime(new Date());
      setSyncStatus('synced');
      setSyncError(null);
      
      console.log('✅ Manual sync completed successfully');
    } catch (error) {
      setSyncStatus('error');
      setSyncError(error.message);
      console.error('❌ Manual sync error:', error);
      throw error;
    }
  };

  // Helper functions
  const getCongestionLevel = (vehicles) => {
    if (vehicles <= 5) return 'low';
    if (vehicles <= 15) return 'medium';
    return 'high';
  };

  const getTrafficStatus = (congestion) => {
    switch (congestion) {
      case 'low': return 'clear';
      case 'medium': return 'moderate';
      case 'high': return 'congested';
      default: return 'clear';
    }
  };

  const getWaitTime = (congestion) => {
    switch (congestion) {
      case 'low': return Math.floor(Math.random() * 3) + 1; // 1-3 minutes
      case 'medium': return Math.floor(Math.random() * 8) + 5; // 5-12 minutes
      case 'high': return Math.floor(Math.random() * 10) + 10; // 10-20 minutes
      default: return 5;
    }
  };

  const getFlowRate = (congestion) => {
    switch (congestion) {
      case 'low': return Math.floor(Math.random() * 20) + 80; // 80-100%
      case 'medium': return Math.floor(Math.random() * 20) + 60; // 60-80%
      case 'high': return Math.floor(Math.random() * 30) + 30; // 30-60%
      default: return 70;
    }
  };

  // Get traffic light state for a direction
  const getTrafficLightState = (direction) => {
    const lights = trafficLights[direction];
    if (lights.green) return 'green';
    if (lights.orange) return 'orange';
    if (lights.blue) return 'blue';
    if (lights.red) return 'red';
    return 'red'; // default
  };

  // Convert sensor data to user-friendly traffic status with traffic light consideration
  const getTrafficStatusData = () => {
    return {
      north: {
        status: getTrafficStatus(sensorData.north.congestion),
        waitTime: getWaitTime(sensorData.north.congestion),
        flow: getFlowRate(sensorData.north.congestion),
        trafficLight: getTrafficLightState('north'),
        isManualMode: !isAutomaticMode,
        currentPhase: currentPhase === 'north',
        nextPhase: nextPhase === 'north',
        cyclistPriority: cyclistPriority === 'north',
        priorityMode: priorityMode && priorityDirection === 'north'
      },
      east: {
        status: getTrafficStatus(sensorData.east.congestion),
        waitTime: getWaitTime(sensorData.east.congestion),
        flow: getFlowRate(sensorData.east.congestion),
        trafficLight: getTrafficLightState('east'),
        isManualMode: !isAutomaticMode,
        currentPhase: currentPhase === 'east',
        nextPhase: nextPhase === 'east',
        cyclistPriority: cyclistPriority === 'east',
        priorityMode: priorityMode && priorityDirection === 'east'
      },
      south: {
        status: getTrafficStatus(sensorData.south.congestion),
        waitTime: getWaitTime(sensorData.south.congestion),
        flow: getFlowRate(sensorData.south.congestion),
        trafficLight: getTrafficLightState('south'),
        isManualMode: !isAutomaticMode,
        currentPhase: currentPhase === 'south',
        nextPhase: nextPhase === 'south',
        cyclistPriority: cyclistPriority === 'south',
        priorityMode: priorityMode && priorityDirection === 'south'
      }
    };
  };

  // Effect: Whenever sensorData changes, send to backend for auto-update
  useEffect(() => {
    // Only run if not the initial mount
    if (!sensorData) return;
    fetch('http://localhost:3001/api/command/auto-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sensorData }),
    }).catch(err => console.error('Failed to auto-update traffic command:', err));
  }, [sensorData]);

  // Poll backend for traffic state
  useEffect(() => {
    const poll = async () => {
      try {
        const state = await trafficStateService.getTrafficState();
        setBackendTrafficState(state);
      } catch (err) {
        // Optionally handle error
      }
    };
    poll();
    const interval = setInterval(poll, 1000);
    return () => clearInterval(interval);
  }, []);

  // Manual override function
  const overrideTrafficState = async (override) => {
    try {
      await trafficStateService.overrideTrafficState(override);
    } catch (err) {
      // Optionally handle error
    }
  };

  // Context value
  const value = {
    // Raw sensor data (for officers)
    sensorData,
    setSensorData,
    
    // Traffic light control (for officers)
    trafficLights,
    setTrafficLights,
    currentPhase,
    setCurrentPhase,
    nextPhase,
    setNextPhase,
    phaseTimer,
    setPhaseTimer,
    isAutomaticMode,
    setIsAutomaticMode,
    cyclistPriority,
    setCyclistPriority,
    cyclistTimer,
    setCyclistTimer,
    priorityMode,
    setPriorityMode,
    priorityDirection,
    setPriorityDirection,
    
    // Phase countdown and type (for synchronization)
    phaseCountdown,
    setPhaseCountdown,
    phaseType,
    setPhaseType,
    
    // User-friendly traffic status (for users)
    getTrafficStatusData,
    
    // Firebase sync state and functions
    isFirebaseReady,
    syncStatus,
    lastSyncTime,
    syncError,
    manualSync,
    startAutoSync,
    stopAutoSync,
    
    // Helper functions
    getCongestionLevel,
    getTrafficStatus,
    getWaitTime,
    getFlowRate,
    getTrafficLightState,

    // Backend traffic state
    backendTrafficState,
    overrideTrafficState,
  };

  return (
    <TrafficDataContext.Provider value={value}>
      {children}
    </TrafficDataContext.Provider>
  );
};

// Custom hook to use traffic data context
export const useTrafficData = () => {
  const context = useContext(TrafficDataContext);
  if (!context) {
    throw new Error('useTrafficData must be used within a TrafficDataProvider');
  }
  return context;
}; 