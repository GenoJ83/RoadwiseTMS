import React, { useState } from 'react';

const directions = ['North', 'East', 'South'];
const states = ['Red', 'Orange', 'Green', 'Blue'];

const directionInitials = { north: 'N', east: 'E', south: 'S' };
const BACKEND_API = 'http://localhost:3001';

const TrafficLightControl = () => {
  const [active, setActive] = useState({ North: 'Red', East: 'Red', South: 'Red' });
  const [isSending, setIsSending] = useState(false);
  const [lastCommand, setLastCommand] = useState(null);
  const [error, setError] = useState(null);

  const handleSetState = async (dir, state) => {
    setError(null);
    try {
      setIsSending(true);
      // Only one direction can be Orange/Green/Blue at a time
      if (['Orange', 'Green', 'Blue'].includes(state)) {
        const newActive = { North: 'Red', East: 'Red', South: 'Red' };
        newActive[dir] = state;
        setActive(newActive);
      } else {
        setActive(prev => ({ ...prev, [dir]: 'Red' }));
      }
      // Sending HTTP command to backend
      const payload = {
        junction: dir,
        command: `${directionInitials[dir]}:${state.toUpperCase()}`
      };
      const response = await fetch(`${BACKEND_API}/api/command/traffic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to send command');
      setLastCommand({
        direction: dir,
        state: state,
        timestamp: new Date().toLocaleTimeString(),
        success: true
      });
    } catch (error) {
      setLastCommand({
        direction: dir,
        state: state,
        timestamp: new Date().toLocaleTimeString(),
        success: false,
        error: error.message
      });
      setError(error.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mb-6 p-6 bg-white rounded-lg shadow-lg border border-gray-200">
      <h3 className="text-xl font-bold mb-4 text-gray-800">🚦 Traffic Light Control</h3>
      <div className="space-y-4">
        {directions.map(dir => (
          <div key={dir} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <span className="w-20 font-bold text-gray-700">{dir}</span>
            {states.map(state => (
              <button
                key={state}
                disabled={isSending}
                className={`px-4 py-2 rounded-lg font-semibold border-2 transition-all duration-200 ${
                  active[dir] === state
                    ? state === 'Red'
                      ? 'bg-red-600 text-white border-red-600 shadow-lg'
                      : state === 'Orange'
                      ? 'bg-yellow-500 text-black border-yellow-500 shadow-lg'
                      : state === 'Green'
                      ? 'bg-green-600 text-white border-green-600 shadow-lg'
                      : 'bg-blue-600 text-white border-blue-600 shadow-lg'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                } ${isSending ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                onClick={() => handleSetState(dir, state)}
              >
                {state}
              </button>
            ))}
          </div>
        ))}
      </div>
      {/* Command Status */}
      {lastCommand && (
        <div className={`mt-4 p-3 rounded-lg border ${
          lastCommand.success 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold">Last Command:</span>
              <span className="ml-2">{lastCommand.direction} → {lastCommand.state}</span>
            </div>
            <div className="text-sm">
              {lastCommand.timestamp}
              {lastCommand.success ? ' ✅' : ' ❌'}
            </div>
          </div>
          {!lastCommand.success && (
            <div className="text-sm mt-1">Error: {lastCommand.error}</div>
          )}
        </div>
      )}
      {error && (
        <div className="mt-2 text-red-600 text-sm font-semibold">{error}</div>
      )}
      {/* Arduino Connection Status */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="text-sm text-blue-800">
            <span className="font-semibold">Arduino WiFi Control:</span>
            <span className="ml-2">Active</span>
          </div>
          <div className="text-xs text-blue-600">
            Commands sent via WiFi to NodeMCU
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficLightControl; import React, { useState } from 'react';

const directions = ['North', 'East', 'South'];
const states = ['Red', 'Orange', 'Green', 'Blue'];

const directionInitials = { north: 'N', east: 'E', south: 'S' };
const BACKEND_API = 'http://localhost:3001';

const TrafficLightControl = () => {
  const [active, setActive] = useState({ North: 'Red', East: 'Red', South: 'Red' });
  const [isSending, setIsSending] = useState(false);
  const [lastCommand, setLastCommand] = useState(null);
  const [error, setError] = useState(null);

  const handleSetState = async (dir, state) => {
    setError(null);
    try {
      setIsSending(true);
      // Only one direction can be Orange/Green/Blue at a time
      if (['Orange', 'Green', 'Blue'].includes(state)) {
        const newActive = { North: 'Red', East: 'Red', South: 'Red' };
        newActive[dir] = state;
        setActive(newActive);
      } else {
        setActive(prev => ({ ...prev, [dir]: 'Red' }));
      }
      // Sending HTTP command to backend
      const payload = {
        junction: dir,
        command: `${directionInitials[dir]}:${state.toUpperCase()}`
      };
      const response = await fetch(`${BACKEND_API}/api/command/traffic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to send command');
      setLastCommand({
        direction: dir,
        state: state,
        timestamp: new Date().toLocaleTimeString(),
        success: true
      });
    } catch (error) {
      setLastCommand({
        direction: dir,
        state: state,
        timestamp: new Date().toLocaleTimeString(),
        success: false,
        error: error.message
      });
      setError(error.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mb-6 p-6 bg-white rounded-lg shadow-lg border border-gray-200">
      <h3 className="text-xl font-bold mb-4 text-gray-800">🚦 Traffic Light Control</h3>
      <div className="space-y-4">
        {directions.map(dir => (
          <div key={dir} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <span className="w-20 font-bold text-gray-700">{dir}</span>
            {states.map(state => (
              <button
                key={state}
                disabled={isSending}
                className={`px-4 py-2 rounded-lg font-semibold border-2 transition-all duration-200 ${
                  active[dir] === state
                    ? state === 'Red'
                      ? 'bg-red-600 text-white border-red-600 shadow-lg'
                      : state === 'Orange'
                      ? 'bg-yellow-500 text-black border-yellow-500 shadow-lg'
                      : state === 'Green'
                      ? 'bg-green-600 text-white border-green-600 shadow-lg'
                      : 'bg-blue-600 text-white border-blue-600 shadow-lg'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                } ${isSending ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                onClick={() => handleSetState(dir, state)}
              >
                {state}
              </button>
            ))}
          </div>
        ))}
      </div>
      {/* Command Status */}
      {lastCommand && (
        <div className={`mt-4 p-3 rounded-lg border ${
          lastCommand.success 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold">Last Command:</span>
              <span className="ml-2">{lastCommand.direction} → {lastCommand.state}</span>
            </div>
            <div className="text-sm">
              {lastCommand.timestamp}
              {lastCommand.success ? ' ✅' : ' ❌'}
            </div>
          </div>
          {!lastCommand.success && (
            <div className="text-sm mt-1">Error: {lastCommand.error}</div>
          )}
        </div>
      )}
      {error && (
        <div className="mt-2 text-red-600 text-sm font-semibold">{error}</div>
      )}
      {/* Arduino Connection Status */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="text-sm text-blue-800">
            <span className="font-semibold">Arduino WiFi Control:</span>
            <span className="ml-2">Active</span>
          </div>
          <div className="text-xs text-blue-600">
            Commands sent via WiFi to NodeMCU
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficLightControl; 