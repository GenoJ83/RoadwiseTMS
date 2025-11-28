import React, { useState, useEffect } from 'react';
import { testConnection, healthService } from '../services/apiService';

const BackendStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [healthData, setHealthData] = useState(null);
  const [error, setError] = useState(null);

  const checkConnection = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Testing backend connection...');
      const connected = await testConnection();
      setIsConnected(connected);
      
      if (connected) {
        console.log('📊 Fetching health data...');
        const health = await healthService.checkBackendHealth();
        setHealthData(health);
        console.log('✅ Health data received:', health);
      }
    } catch (err) {
      console.error('❌ Connection test failed:', err);
      setError(err.message);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <span className="mr-2">🔗</span>
        Backend Connection Status
      </h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-medium">Status:</span>
          <div className="flex items-center">
            {isLoading ? (
              <span className="text-yellow-600">🔄 Checking...</span>
            ) : isConnected ? (
              <span className="text-green-600">✅ Connected</span>
            ) : (
              <span className="text-red-600">❌ Disconnected</span>
            )}
          </div>
        </div>

        {healthData && (
          <div className="bg-gray-50 rounded p-3">
            <h4 className="font-medium mb-2">Health Check Data:</h4>
            <pre className="text-sm text-gray-700">
              {JSON.stringify(healthData, null, 2)}
            </pre>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <h4 className="font-medium text-red-800 mb-1">Error:</h4>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={checkConnection}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm transition-colors"
        >
          {isLoading ? 'Checking...' : 'Test Connection'}
        </button>
      </div>
    </div>
  );
};

export default BackendStatus; 