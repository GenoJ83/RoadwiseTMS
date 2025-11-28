import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';

const RoutePlanner = () => {
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [transportMode, setTransportMode] = useState('car');
  const [routeOptions, setRouteOptions] = useState([]);
  const [isPlanning, setIsPlanning] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const navigate = useNavigate();

  const locations = [
    { id: 'north', name: 'North Junction', address: 'Main Street & Highway 101' },
    { id: 'east', name: 'East Junction', address: 'Highway Exit & City Road' },
    { id: 'south', name: 'South Junction', address: 'City Center & Downtown Ave' },
    { id: 'downtown', name: 'Downtown', address: 'Central Business District' },
    { id: 'airport', name: 'Airport', address: 'International Airport Terminal' },
    { id: 'mall', name: 'Shopping Mall', address: 'Westfield Shopping Center' }
  ];

  const transportModes = [
    { id: 'car', name: 'Car', icon: '🚗', description: 'Personal vehicle' },
    { id: 'bike', name: 'Bicycle', icon: '🚴', description: 'Cycling route' },
    { id: 'walk', name: 'Walking', icon: '🚶', description: 'Pedestrian route' },
    { id: 'bus', name: 'Public Transport', icon: '🚌', description: 'Bus routes' }
  ];

  const handlePlanRoute = () => {
    if (!startLocation || !endLocation) {
      alert('Please select both start and end locations');
      return;
    }

    setIsPlanning(true);

    // Simulate route planning
    setTimeout(() => {
      const routes = [
        {
          id: 1,
          name: 'Fastest Route',
          duration: Math.floor(Math.random() * 30) + 15,
          distance: (Math.random() * 10 + 5).toFixed(1),
          traffic: 'low',
          junctions: ['north', 'east'],
          description: 'Optimal route with minimal traffic',
          color: 'green'
        },
        {
          id: 2,
          name: 'Scenic Route',
          duration: Math.floor(Math.random() * 45) + 25,
          distance: (Math.random() * 15 + 8).toFixed(1),
          traffic: 'medium',
          junctions: ['north', 'south'],
          description: 'Picturesque route through city center',
          color: 'blue'
        },
        {
          id: 3,
          name: 'Alternative Route',
          duration: Math.floor(Math.random() * 35) + 20,
          distance: (Math.random() * 12 + 6).toFixed(1),
          traffic: 'low',
          junctions: ['east', 'south'],
          description: 'Less congested alternative path',
          color: 'purple'
        }
      ];

      setRouteOptions(routes);
      setIsPlanning(false);
    }, 2000);
  };

  const getTrafficColor = (traffic) => {
    switch (traffic) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrafficIcon = (traffic) => {
    switch (traffic) {
      case 'low': return '🟢';
      case 'medium': return '🟡';
      case 'high': return '🔴';
      default: return '⚪';
    }
  };

  const getRouteColor = (color) => {
    switch (color) {
      case 'green': return 'border-green-500 bg-green-50';
      case 'blue': return 'border-blue-500 bg-blue-50';
      case 'purple': return 'border-purple-500 bg-purple-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Route Planner Navigation */}
      <nav className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-xl border-b border-green-500">
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
                <div className="text-sm text-green-100 font-medium">Route Planner</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard/user')}
                className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Route Planner Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 bg-white rounded-2xl shadow-xl p-8 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Smart Route Planner</h1>
              <p className="text-gray-600">Plan optimal routes based on real-time traffic conditions</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Transport Mode</div>
              <div className="text-lg font-semibold text-green-600">
                {transportModes.find(m => m.id === transportMode)?.icon} {transportModes.find(m => m.id === transportMode)?.name}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Route Configuration */}
          <div className="space-y-8">
            {/* Transport Mode Selection */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Transport Mode</h2>
              <div className="grid grid-cols-2 gap-4">
                {transportModes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setTransportMode(mode.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      transportMode === mode.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">{mode.icon}</div>
                      <div className="text-sm font-semibold text-gray-800">{mode.name}</div>
                      <div className="text-xs text-gray-600">{mode.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Location Selection */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Route Details</h2>
              
              {/* Start Location */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Start Location</label>
                <select
                  value={startLocation}
                  onChange={(e) => setStartLocation(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select start location</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name} - {location.address}
                    </option>
                  ))}
                </select>
              </div>

              {/* End Location */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Destination</label>
                <select
                  value={endLocation}
                  onChange={(e) => setEndLocation(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select destination</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name} - {location.address}
                    </option>
                  ))}
                </select>
              </div>

              {/* Plan Route Button */}
              <button
                onClick={handlePlanRoute}
                disabled={isPlanning || !startLocation || !endLocation}
                className={`w-full py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold ${
                  isPlanning || !startLocation || !endLocation
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                }`}
              >
                <div className="text-2xl mb-2">{isPlanning ? '⏳' : '🗺️'}</div>
                {isPlanning ? 'Planning Route...' : 'Plan Route'}
              </button>
            </div>
          </div>

          {/* Route Results */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Route Options</h2>
            
            {routeOptions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">🗺️</div>
                <div className="text-lg font-semibold">No routes planned yet</div>
                <div className="text-sm">Select locations and transport mode to plan your route</div>
              </div>
            ) : (
              <div className="space-y-4">
                {routeOptions.map((route) => (
                  <div
                    key={route.id}
                    onClick={() => setSelectedRoute(route)}
                    className={`p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer hover:shadow-lg ${
                      selectedRoute?.id === route.id
                        ? getRouteColor(route.color) + ' shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{route.name}</h3>
                        <p className="text-sm text-gray-600">{route.description}</p>
                      </div>
                      <div className={`text-sm px-3 py-1 rounded-full border-2 font-semibold ${
                        route.traffic === 'low' ? 'bg-green-100 text-green-800 border-green-200' :
                        route.traffic === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                        'bg-red-100 text-red-800 border-red-200'
                      }`}>
                        {getTrafficIcon(route.traffic)} {route.traffic} traffic
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-xl font-bold text-gray-800">{route.duration} min</div>
                        <div className="text-xs text-gray-600">Duration</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-gray-800">{route.distance} km</div>
                        <div className="text-xs text-gray-600">Distance</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Via: {route.junctions.map(j => locations.find(l => l.id === j)?.name).join(' → ')}
                      </div>
                      <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors text-sm">
                        Select Route
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Selected Route Details */}
        {selectedRoute && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Selected Route Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl mb-2">⏱️</div>
                <div className="text-2xl font-bold text-gray-800">{selectedRoute.duration} min</div>
                <div className="text-sm text-gray-600">Estimated Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">📏</div>
                <div className="text-2xl font-bold text-gray-800">{selectedRoute.distance} km</div>
                <div className="text-sm text-gray-600">Total Distance</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">{getTrafficIcon(selectedRoute.traffic)}</div>
                <div className="text-2xl font-bold text-gray-800 capitalize">{selectedRoute.traffic}</div>
                <div className="text-sm text-gray-600">Traffic Level</div>
              </div>
            </div>
            
            <div className="mt-6 p-6 bg-gray-50 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Route Instructions</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <span className="text-gray-700">Start at {locations.find(l => l.id === startLocation)?.name}</span>
                </div>
                {selectedRoute.junctions.map((junction, index) => (
                  <div key={junction} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 2}
                    </div>
                    <span className="text-gray-700">Continue through {locations.find(l => l.id === junction)?.name}</span>
                  </div>
                ))}
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {selectedRoute.junctions.length + 2}
                  </div>
                  <span className="text-gray-700">Arrive at {locations.find(l => l.id === endLocation)?.name}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Route Tips */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Route Planning Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">🚗 For Drivers</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Check traffic conditions before departure</li>
                <li>• Consider alternative routes during peak hours</li>
                <li>• Allow extra time for unexpected delays</li>
                <li>• Use real-time navigation updates</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">🚴 For Cyclists</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Look for dedicated bike lanes</li>
                <li>• Check for cyclist priority signals</li>
                <li>• Plan routes with less traffic</li>
                <li>• Consider weather conditions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default RoutePlanner; 