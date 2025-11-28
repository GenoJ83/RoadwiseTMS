import React, { useState } from 'react';
import { commandService, smsService } from '../services/apiService';

const BackendTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message, success = true) => {
    setTestResults(prev => [...prev, {
      id: Date.now(),
      message,
      success,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testTrafficCommand = async () => {
    setIsLoading(true);
    try {
      const result = await commandService.sendTrafficCommand({
        junction: 'north',
        command: 'set_green',
        priority: 'normal'
      });
      addResult(`✅ Traffic command sent: ${JSON.stringify(result)}`);
    } catch (error) {
      addResult(`❌ Traffic command failed: ${error.message}`, false);
    } finally {
      setIsLoading(false);
    }
  };

  const testSMS = async () => {
    setIsLoading(true);
    try {
      const result = await smsService.sendSMS('+1234567890', 'Test SMS from RoadWise TMS');
      addResult(`✅ SMS sent: ${JSON.stringify(result)}`);
    } catch (error) {
      addResult(`❌ SMS failed: ${error.message}`, false);
    } finally {
      setIsLoading(false);
    }
  };

  const testSystemStatus = async () => {
    setIsLoading(true);
    try {
      const result = await commandService.getSystemStatus();
      addResult(`✅ System status: ${JSON.stringify(result)}`);
    } catch (error) {
      addResult(`❌ System status failed: ${error.message}`, false);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <span className="mr-2">🧪</span>
        Backend API Test
      </h3>
      
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={testTrafficCommand}
            disabled={isLoading}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm transition-colors"
          >
            Test Traffic Command
          </button>
          
          <button
            onClick={testSMS}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm transition-colors"
          >
            Test SMS
          </button>
          
          <button
            onClick={testSystemStatus}
            disabled={isLoading}
            className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm transition-colors"
          >
            Test System Status
          </button>
          
          <button
            onClick={clearResults}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors"
          >
            Clear Results
          </button>
        </div>

        {testResults.length > 0 && (
          <div className="bg-gray-50 rounded p-4 max-h-64 overflow-y-auto">
            <h4 className="font-medium mb-2">Test Results:</h4>
            <div className="space-y-2">
              {testResults.map(result => (
                <div
                  key={result.id}
                  className={`text-sm p-2 rounded ${
                    result.success 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span>{result.message}</span>
                    <span className="text-xs opacity-75 ml-2">{result.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackendTest; 