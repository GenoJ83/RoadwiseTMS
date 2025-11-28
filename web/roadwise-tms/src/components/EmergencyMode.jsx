import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';

const EmergencyMode = () => {
  const [emergencyType, setEmergencyType] = useState('');
  const [affectedJunctions, setAffectedJunctions] = useState([]);
  const [emergencyMessage, setEmergencyMessage] = useState('');
  const [isActive, setIsActive] = useState(false);
  const navigate = useNavigate();

  const emergencyTypes = [
    { id: 'accident', name: 'Traffic Accident', icon: '🚗💥', color: 'red' },
    { id: 'fire', name: 'Fire Emergency', icon: '🔥', color: 'orange' },
    { id: 'medical', name: 'Medical Emergency', icon: '🚑', color: 'blue' },
    { id: 'police', name: 'Police Operation', icon: '🚔', color: 'purple' },
    { id: 'weather', name: 'Weather Emergency', icon: '⛈️', color: 'gray' }
  ];

  const junctions = [
    { id: 'north', name: 'North Junction', location: 'Main Street' },
    { id: 'east', name: 'East Junction', location: 'Highway Exit' },
    { id: 'south', name: 'South Junction', location: 'City Center' }
  ];

  const handleEmergencyActivation = () => {
    if (!emergencyType || affectedJunctions.length === 0) {
      alert('Please select emergency type and affected junctions');
      return;
    }
    setIsActive(true);
    // In a real app, this would trigger emergency protocols
    console.log('Emergency Mode Activated:', { emergencyType, affectedJunctions, emergencyMessage });
  };

  const handleEmergencyDeactivation = () => {
    setIsActive(false);
    setEmergencyType('');
    setAffectedJunctions([]);
    setEmergencyMessage('');
  };

  const toggleJunction = (junctionId) => {
    setAffectedJunctions(prev => 
      prev.includes(junctionId) 
        ? prev.filter(id => id !== junctionId)
        : [...prev, junctionId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      {/* Emergency Navigation */}
      <nav className="bg-gradient-to-r from-red-600 to-red-700 text-white shadow-xl border-b border-red-500">
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
                <div className="text-sm text-red-100 font-medium">Emergency Mode</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard/officer')}
                className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Emergency Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Emergency Status */}
        <div className="mb-8 bg-white rounded-2xl shadow-xl p-8 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Emergency Control Center</h1>
              <p className="text-gray-600">Activate emergency protocols for traffic management</p>
            </div>
            <div className={`px-6 py-3 rounded-xl font-semibold text-white ${
              isActive ? 'bg-red-600 animate-pulse' : 'bg-gray-400'
            }`}>
              {isActive ? '🚨 EMERGENCY ACTIVE' : '⚪ STANDBY MODE'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Emergency Type Selection */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Emergency Type</h2>
            <div className="space-y-4">
              {emergencyTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setEmergencyType(type.id)}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
                    emergencyType === type.id
                      ? `border-${type.color}-500 bg-${type.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{type.icon}</div>
                    <div className="text-left">
                      <div className="text-lg font-semibold text-gray-800">{type.name}</div>
                      <div className="text-sm text-gray-600">Select this emergency type</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Affected Junctions */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Affected Junctions</h2>
            <div className="space-y-4">
              {junctions.map((junction) => (
                <button
                  key={junction.id}
                  onClick={() => toggleJunction(junction.id)}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
                    affectedJunctions.includes(junction.id)
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <div className="text-lg font-semibold text-gray-800">{junction.name}</div>
                      <div className="text-sm text-gray-600">{junction.location}</div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 ${
                      affectedJunctions.includes(junction.id)
                        ? 'bg-red-500 border-red-500'
                        : 'border-gray-300'
                    }`}>
                      {affectedJunctions.includes(junction.id) && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Emergency Message */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Emergency Message</h2>
          <textarea
            value={emergencyMessage}
            onChange={(e) => setEmergencyMessage(e.target.value)}
            placeholder="Enter emergency details, instructions, or additional information..."
            className="w-full h-32 p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Emergency Actions */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Emergency Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {!isActive ? (
              <button
                onClick={handleEmergencyActivation}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white py-4 px-6 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
              >
                <div className="text-2xl mb-2">🚨</div>
                Activate Emergency Mode
              </button>
            ) : (
              <button
                onClick={handleEmergencyDeactivation}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
              >
                <div className="text-2xl mb-2">✅</div>
                Deactivate Emergency
              </button>
            )}
            
            <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold">
              <div className="text-2xl mb-2">📞</div>
              Contact Authorities
            </button>
            
            <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold">
              <div className="text-2xl mb-2">📊</div>
              Generate Report
            </button>
          </div>
        </div>

        {/* Emergency Procedures */}
        <div className="mt-8 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-8 border border-red-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Emergency Procedures</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">🚨 Immediate Actions</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Activate emergency traffic signals</li>
                <li>• Clear affected junctions</li>
                <li>• Redirect traffic flow</li>
                <li>• Contact emergency services</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">📋 Documentation</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Record emergency details</li>
                <li>• Document traffic diversions</li>
                <li>• Log response times</li>
                <li>• Generate incident report</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default EmergencyMode; 