import React, { useState, useEffect } from 'react';
import { useTrafficData } from '../contexts/TrafficDataContext';
import { trafficDataSync } from '../services/trafficDataSync';

const FirebaseSyncStatus = ({ compact = false }) => {
  const {
    isFirebaseReady,
    syncStatus,
    lastSyncTime,
    syncError,
    manualSync,
    startAutoSync,
    stopAutoSync
  } = useTrafficData();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [syncCount, setSyncCount] = useState(0);
  const [testingConnection, setTestingConnection] = useState(false);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Count syncs
  useEffect(() => {
    if (syncStatus === 'synced') {
      setSyncCount(prev => prev + 1);
    }
  }, [syncStatus]);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      const result = await trafficDataSync.testConnection();
      if (result) {
        alert('✅ Firebase connection test successful!');
      } else {
        alert('❌ Firebase connection test failed. Check console for details.');
      }
    } catch (error) {
      alert(`❌ Connection test error: ${error.message}`);
    } finally {
      setTestingConnection(false);
    }
  };

  const getConnectionStatus = () => {
    return trafficDataSync.getConnectionStatus();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready':
      case 'synced':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'syncing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'initializing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ready':
      case 'synced':
        return '✅';
      case 'syncing':
        return '🔄';
      case 'error':
        return '❌';
      case 'initializing':
        return '⏳';
      default:
        return '⚪';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ready':
        return 'Firebase Ready';
      case 'synced':
        return 'Data Synced';
      case 'syncing':
        return 'Syncing...';
      case 'error':
        return 'Sync Error';
      case 'initializing':
        return 'Initializing...';
      default:
        return 'Unknown Status';
    }
  };

  const formatTime = (date) => {
    if (!date) return 'Never';
    return date.toLocaleTimeString();
  };

  const getTimeSinceLastSync = () => {
    if (!lastSyncTime) return 'Never';
    const diff = currentTime.getTime() - lastSyncTime.getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${
          syncStatus === 'synced' || syncStatus === 'ready' ? 'bg-green-500' :
          syncStatus === 'syncing' ? 'bg-blue-500 animate-pulse' :
          syncStatus === 'error' ? 'bg-red-500' :
          'bg-yellow-500'
        }`}></div>
        <span className="text-xs text-gray-600">
          {syncStatus === 'synced' || syncStatus === 'ready' ? 'Synced' :
           syncStatus === 'syncing' ? 'Syncing...' :
           syncStatus === 'error' ? 'Error' :
           'Initializing...'}
        </span>
        {lastSyncTime && (
          <span className="text-xs text-gray-500">
            ({getTimeSinceLastSync()})
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">Firebase Sync Status</h3>
        <div className={`px-3 py-1 rounded-full border-2 text-sm font-medium ${getStatusColor(syncStatus)}`}>
          {getStatusIcon(syncStatus)} {getStatusText(syncStatus)}
        </div>
      </div>

      <div className="space-y-3">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Connection:</span>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isFirebaseReady ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium">
              {isFirebaseReady ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Last Sync Time */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Last Sync:</span>
          <div className="text-right">
            <div className="text-sm font-mono text-gray-800">
              {formatTime(lastSyncTime)}
            </div>
            <div className="text-xs text-gray-500">
              {getTimeSinceLastSync()}
            </div>
          </div>
        </div>

        {/* Sync Count */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Total Syncs:</span>
          <span className="text-sm font-semibold text-gray-800">{syncCount}</span>
        </div>

        {/* Current Time */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Current Time:</span>
          <span className="text-sm font-mono text-gray-800">
            {currentTime.toLocaleTimeString()}
          </span>
        </div>

        {/* Error Display */}
        {syncError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <span className="text-red-500">⚠️</span>
              <div>
                <div className="text-sm font-medium text-red-800">Sync Error</div>
                <div className="text-xs text-red-600 mt-1">{syncError}</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <button
            onClick={manualSync}
            disabled={!isFirebaseReady || syncStatus === 'syncing'}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              !isFirebaseReady || syncStatus === 'syncing'
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm hover:shadow-md'
            }`}
          >
            {syncStatus === 'syncing' ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Syncing...
              </div>
            ) : (
              'Manual Sync'
            )}
          </button>

          <button
            onClick={handleTestConnection}
            disabled={testingConnection}
            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              testingConnection
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-purple-500 text-white hover:bg-purple-600 shadow-sm hover:shadow-md'
            }`}
          >
            {testingConnection ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Testing...
              </div>
            ) : (
              'Test'
            )}
          </button>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={startAutoSync}
            disabled={!isFirebaseReady}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              !isFirebaseReady
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-500 text-white hover:bg-green-600 shadow-sm hover:shadow-md'
            }`}
          >
            Start Auto
          </button>

          <button
            onClick={stopAutoSync}
            disabled={!isFirebaseReady}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              !isFirebaseReady
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-red-500 text-white hover:bg-red-600 shadow-sm hover:shadow-md'
            }`}
          >
            Stop Auto
          </button>
        </div>

        {/* Sync Info */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-600 space-y-1">
            <div>• Sensor data syncs every 5 seconds</div>
            <div>• Traffic lights sync every 2 seconds</div>
            <div>• System mode syncs every 10 seconds</div>
            <div>• Events logged every 30 seconds</div>
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-xs text-blue-600 space-y-1">
            <div>🔍 Debug Info:</div>
            <div>• Firebase Ready: {isFirebaseReady ? 'Yes' : 'No'}</div>
            <div>• Sync Status: {syncStatus}</div>
            <div>• Sync Count: {syncCount}</div>
            <div>• Check browser console for detailed logs</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseSyncStatus; 