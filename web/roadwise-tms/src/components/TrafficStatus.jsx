import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';

const TrafficStatus = () => {
  const [trafficStatus, setTrafficStatus] = useState({
    north: { status: 'flowing', congestion: 'medium', waitTime: 8, incidents: [] },
    east: { status: 'flowing', congestion: 'low', waitTime: 4, incidents: [] },
    south: { status: 'congested', congestion: 'high', waitTime: 15, incidents: ['Minor accident'] }
  });
  const [selectedJunction, setSelectedJunction] = useState('all');
  const [timeFilter, setTimeFilter] = useState('now');
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setTrafficStatus(prev => ({
        north: {
          ...prev.north,
          waitTime: Math.max(2, Math.min(20, prev.north.waitTime + (Math.random() - 0.5) * 2)),
          congestion: getCongestionLevel(prev.north.waitTime)
        },
        east: {
          ...prev.east,
          waitTime: Math.max(2, Math.min(20, prev.east.waitTime + (Math.random() - 0.5) * 2)),
          congestion: getCongestionLevel(prev.east.waitTime)
        },
        south: {
          ...prev.south,
          waitTime: Math.max(2, Math.min(20, prev.south.waitTime + (Math.random() - 0.5) * 2)),
          congestion: getCongestionLevel(prev.south.waitTime)
        }
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getCongestionLevel = (waitTime) => {
    if (waitTime <= 5) return 'low';
    if (waitTime <= 10) return 'medium';
    return 'high';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'flowing': return 'text-green-600';
      case 'slow': return 'text-yellow-600';
      case 'congested': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'flowing': return '🟢';
      case 'slow': return '🟡';
      case 'congested': return '🔴';
      default: return '⚪';
    }
  };

  const getCongestionColor = (congestion) => {
    switch (congestion) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const junctions = [
    { id: 'north', name: 'North Junction', location: 'Main Street', description: 'Primary route to downtown' },
    { id: 'east', name: 'East Junction', location: 'Highway Exit', description: 'Highway access point' },
    { id: 'south', name: 'South Junction', location: 'City Center', description: 'Urban center access' }
  ];

  const timeFilters = [
    { id: 'now', name: 'Live', description: 'Current status' },
    { id: '15min', name: '15 min', description: 'Next 15 minutes' },
    { id: '30min', name: '30 min', description: 'Next 30 minutes' },
    { id: '1hour', name: '1 hour', description: 'Next hour' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Traffic Status Navigation */}
      <nav className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl border-b border-blue-500">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg border-2 border-white border-opacity-30 bg-white">
                <img 
                  src="/logo.jpeg" 
                  alt="RoadWise TMS Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-2xl font-bold tracking-wide">RoadWise TMS</div>
                <div className="text-sm text-blue-100 font-medium">Traffic Status</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard/user')}
                className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Traffic Status Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 bg-white rounded-2xl shadow-xl p-8 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Real-time Traffic Status</h1>
              <p className="text-gray-600">Live traffic information and status updates for all junctions</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Last Updated</div>
              <div className="text-lg font-semibold text-blue-600">{new Date().toLocaleTimeString()}</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Junction Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Select Junction</label>
              <div className="space-y-2">
                {junctions.map((junction) => (
                  <button
                    key={junction.id}
                    onClick={() => setSelectedJunction(junction.id)}
                    className={`w-full p-3 rounded-lg border-2 transition-all duration-200 ${
                      selectedJunction === junction.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-left">
                      <div className="text-sm font-semibold text-gray-800">{junction.name}</div>
                      <div className="text-xs text-gray-600">{junction.location}</div>
                    </div>
                  </button>
                ))}
                <button
                  onClick={() => setSelectedJunction('all')}
                  className={`w-full p-3 rounded-lg border-2 transition-all duration-200 ${
                    selectedJunction === 'all'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-800">All Junctions</div>
                    <div className="text-xs text-gray-600">View all traffic status</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Time Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Time Range</label>
              <div className="space-y-2">
                {timeFilters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setTimeFilter(filter.id)}
                    className={`w-full p-3 rounded-lg border-2 transition-all duration-200 ${
                      timeFilter === filter.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-left">
                      <div className="text-sm font-semibold text-gray-800">{filter.name}</div>
                      <div className="text-xs text-gray-600">{filter.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Traffic Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {junctions.map((junction) => {
            const status = trafficStatus[junction.id];
            const isVisible = selectedJunction === 'all' || selectedJunction === junction.id;
            
            if (!isVisible) return null;

            return (
              <div key={junction.id} className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{junction.name}</h3>
                  <div className="text-sm text-gray-600 mb-3">{junction.location}</div>
                  <div className="text-xs text-gray-500">{junction.description}</div>
                </div>

                {/* Status Indicator */}
                <div className="text-center mb-6">
                  <div className={`text-4xl mb-2 ${getStatusColor(status.status)}`}>
                    {getStatusIcon(status.status)}
                  </div>
                  <div className={`text-lg font-semibold ${getStatusColor(status.status)} capitalize`}>
                    {status.status}
                  </div>
                </div>

                {/* Traffic Metrics */}
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-700">Wait Time</span>
                      <span className="text-lg font-bold text-gray-800">{status.waitTime.toFixed(1)} min</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-700">Congestion</span>
                      <div className={`text-sm px-3 py-1 rounded-full border-2 font-semibold ${getCongestionColor(status.congestion)}`}>
                        {status.congestion}
                      </div>
                    </div>
                  </div>

                  {status.incidents.length > 0 && (
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-red-600">🚨</span>
                        <span className="text-sm font-semibold text-red-800">Incidents</span>
                      </div>
                      <ul className="text-xs text-red-700 space-y-1">
                        {status.incidents.map((incident, index) => (
                          <li key={index}>• {incident}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Live Updates */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-blue-700 font-medium">Live Updates</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Traffic Alerts */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Traffic Alerts</h2>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <div className="flex items-center">
                <div className="text-2xl mr-3">🚨</div>
                <div>
                  <div className="text-sm font-semibold text-red-800">Traffic Incident</div>
                  <div className="text-xs text-red-600">Minor accident at South Junction - Expect delays</div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
              <div className="flex items-center">
                <div className="text-2xl mr-3">⚠️</div>
                <div>
                  <div className="text-sm font-semibold text-yellow-800">Congestion Warning</div>
                  <div className="text-xs text-yellow-600">Heavy traffic expected at North Junction during rush hour</div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
              <div className="flex items-center">
                <div className="text-2xl mr-3">✅</div>
                <div>
                  <div className="text-sm font-semibold text-green-800">Clear Traffic</div>
                  <div className="text-xs text-green-600">East Junction traffic flowing normally</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Traffic Tips */}
        <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border border-green-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Traffic Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">🚗 Driving Tips</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Plan your route in advance</li>
                <li>• Check traffic status before leaving</li>
                <li>• Consider alternative routes</li>
                <li>• Allow extra time for delays</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">🚴 Cycling Tips</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Use dedicated bike lanes</li>
                <li>• Follow traffic signals</li>
                <li>• Be visible with lights</li>
                <li>• Check for cyclist priority signals</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default TrafficStatus; 