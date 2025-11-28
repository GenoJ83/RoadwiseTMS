import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTrafficData } from '../contexts/TrafficDataContext';
import Footer from './Footer';
import DashboardNav from './DashboardNav';

const UserDashboard = () => {
  const { userData, currentUser, isAuthenticated, logout } = useAuth();
  const {
    getTrafficStatusData,
    isAutomaticMode,
    phaseCountdown,
    phaseType,
    currentPhase,
    backendTrafficState,
  } = useTrafficData();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTravelMode, setSelectedTravelMode] = useState('car');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({
    issueType: '',
    location: '',
    description: '',
    severity: 'medium',
    contactInfo: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login/user');
      return;
    }
    
    if (userData && userData.role !== 'user') {
      navigate('/');
      return;
    }
  }, [userData, currentUser, isAuthenticated, navigate]);

  // Updating time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Use shared traffic status from context
  const trafficStatus = getTrafficStatusData();

  const getStatusColor = (status) => {
    switch (status) {
      case 'clear': return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'congested': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'clear': return '🟢';
      case 'moderate': return '🟡';
      case 'congested': return '🔴';
      default: return '⚪';
    }
  };

  const getFlowColor = (flow) => {
    if (flow >= 80) return 'text-green-600';
    if (flow >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrafficLightColor = (light) => {
    switch (light) {
      case 'red': return 'bg-red-600';
      case 'orange': return 'bg-orange-500';
      case 'blue': return 'bg-blue-600';
      case 'green': return 'bg-green-600';
      default: return 'bg-gray-300';
    }
  };

  const getTrafficLightIcon = (light) => {
    switch (light) {
      case 'red': return '🔴';
      case 'orange': return '🟡';
      case 'blue': return '🔵';
      case 'green': return '🟢';
      default: return '⚪';
    }
  };

  const getTrafficLightText = (light) => {
    switch (light) {
      case 'red': return 'STOP';
      case 'orange': return 'WAIT';
      case 'blue': return 'CYCLISTS';
      case 'green': return 'GO';
      default: return 'UNKNOWN';
    }
  };

  const handleFindRoute = () => {
    const travelModeNames = {
      car: 'Car',
      bicycle: 'Bicycle',
      motorcycle: 'Motorcycle'
    };
    
    alert(`Finding best route for ${travelModeNames[selectedTravelMode]} travel mode...`);
    // In a real application, this would call the route planning API
    // For now, we'll just show a confirmation message
  };

  const handleOpenReportModal = () => {
    setShowReportModal(true);
  };

  const handleCloseReportModal = () => {
    setShowReportModal(false);
    setReportForm({
      issueType: '',
      location: '',
      description: '',
      severity: 'medium',
      contactInfo: ''
    });
  };

  const handleFormChange = (field, value) => {
    setReportForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitReport = async () => {
    if (!reportForm.issueType || !reportForm.location || !reportForm.description) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const report = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        userEmail: userData.email,
        ...reportForm
      };
      
      console.log('Report submitted:', report);
      
      setIsSubmitting(false);
      setShowReportModal(false);
      setReportForm({
        issueType: '',
        location: '',
        description: '',
        severity: 'medium',
        contactInfo: ''
      });
      
      alert('Issue reported successfully! Our team will review and take appropriate action.');
    }, 2000);
  };

  if (!userData || userData.role !== 'user') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
      {/* Floating Navigation */}
      <DashboardNav userType="user" />

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
        {/* Welcome Section */}
        <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome back!</h1>
              <p className="text-gray-600">Plan your journey with real-time traffic information</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Today's Date</div>
              <div className="text-lg font-semibold text-gray-800">{currentTime.toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        {/* System Mode Indicator */}
        <div className="mb-8 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-4 h-4 rounded-full ${isAutomaticMode ? 'bg-green-500' : 'bg-blue-500'} animate-pulse`}></div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {isAutomaticMode ? '🤖 Automatic Mode' : '👤 Manual Mode'}
                </h3>
                <p className="text-sm text-gray-600">
                  {isAutomaticMode 
                    ? 'AI-powered traffic control is active' 
                    : 'Traffic officer is manually controlling signals'
                  }
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Last Updated</div>
              <div className="text-lg font-mono font-semibold text-gray-800">{currentTime.toLocaleTimeString()}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Enhanced Current Traffic Status */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Traffic Status</h3>
              <div className="text-sm text-gray-500 font-medium">🚦 Live Updates</div>
            </div>
            <div className="space-y-4">
              {Object.entries(trafficStatus).map(([junction, data]) => (
                <div key={junction} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <span className="text-lg font-semibold text-gray-800 capitalize">{junction} Junction</span>
                      <div className="text-sm text-gray-600">
                        {junction === 'north' ? 'Main Street' : junction === 'east' ? 'Highway Exit' : 'City Center'}
                      </div>
                    </div>
                    <div className={`text-sm px-3 py-1 rounded-full border-2 font-semibold ${getStatusColor(data.status)}`}>
                      {getStatusIcon(data.status)} {data.status}
                    </div>
                  </div>
                  
                  {/* Traffic Light Indicator */}
                  <div className="mb-3 p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-4 h-4 rounded-full ${getTrafficLightColor(data.trafficLight)} shadow-lg`}></div>
                        <span className="text-sm font-semibold text-gray-700">
                          {getTrafficLightText(data.trafficLight)}
                        </span>
                      </div>
                      <div className="text-2xl">
                        {getTrafficLightIcon(data.trafficLight)}
                      </div>
                    </div>
                    
                    {/* Special Indicators */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {data.currentPhase && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          🟢 Current Phase
                        </span>
                      )}
                      {data.nextPhase && (
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                          🟡 Next Phase
                        </span>
                      )}
                      {data.cyclistPriority && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          🔵 Cyclist Priority
                        </span>
                      )}
                      {data.priorityMode && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                          🔥 Priority Mode
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-xl font-bold text-gray-800">{data.waitTime} min</div>
                      <div className="text-xs text-gray-600">Wait Time</div>
                    </div>
                    <div>
                      <div className={`text-xl font-bold ${getFlowColor(data.flow)}`}>{data.flow}%</div>
                      <div className="text-xs text-gray-600">Flow Rate</div>
                    </div>
                  </div>

                  {data.currentPhase && (
                    <div className="text-center mt-2">
                      <div className="text-2xl font-bold text-green-800 mb-1">
                        {phaseCountdown}s
                      </div>
                      <div className="text-sm text-green-600 font-medium">Time Remaining ({phaseType})</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Travel Planning */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Plan Your Route</h3>
              <div className="text-sm text-gray-500 font-medium">🗺️ Navigation</div>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Starting Point</label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200">
                  <option>Select starting point</option>
                  <option>North Junction - Main Street</option>
                  <option>East Junction - Highway Exit</option>
                  <option>South Junction - City Center</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Destination</label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200">
                  <option>Select destination</option>
                  <option>North Junction - Main Street</option>
                  <option>East Junction - Highway Exit</option>
                  <option>South Junction - City Center</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Travel Mode</label>
                <div className="grid grid-cols-3 gap-3">
                  <button 
                    className={`py-3 px-4 rounded-xl transition-all duration-200 font-medium ${
                      selectedTravelMode === 'car' 
                        ? 'bg-green-500 text-white shadow-lg transform scale-105' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedTravelMode('car')}
                  >
                    🚗 Car
                  </button>
                  <button 
                    className={`py-3 px-4 rounded-xl transition-all duration-200 font-medium ${
                      selectedTravelMode === 'bicycle' 
                        ? 'bg-blue-500 text-white shadow-lg transform scale-105' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedTravelMode('bicycle')}
                  >
                    🚴 Bicycle
                  </button>
                  <button 
                    className={`py-3 px-4 rounded-xl transition-all duration-200 font-medium ${
                      selectedTravelMode === 'motorcycle' 
                        ? 'bg-purple-500 text-white shadow-lg transform scale-105' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedTravelMode('motorcycle')}
                  >
                    🏍️ Motorcycle
                  </button>
                </div>
              </div>
              <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold" onClick={handleFindRoute}>
                <div className="text-xl mb-1">🚀</div>
                Find Best Route
              </button>
            </div>
          </div>

          {/* Enhanced Travel Alerts */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Travel Alerts</h3>
              <div className="text-sm text-gray-500 font-medium">⚠️ Notifications</div>
            </div>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-lg">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">🚨</div>
                  <div>
                    <div className="text-sm font-semibold text-red-800">Traffic Jam Ahead</div>
                    <div className="text-xs text-red-600">South Junction - Avoid if possible</div>
                    <div className="text-xs text-red-500 mt-1">2 minutes ago</div>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-500 rounded-lg">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">🚧</div>
                  <div>
                    <div className="text-sm font-semibold text-yellow-800">Construction Work</div>
                    <div className="text-xs text-yellow-600">East Junction - Expect delays</div>
                    <div className="text-xs text-yellow-500 mt-1">15 minutes ago</div>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 rounded-lg">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">🌧️</div>
                  <div>
                    <div className="text-sm font-semibold text-blue-800">Weather Alert</div>
                    <div className="text-xs text-blue-600">Rain expected - Drive carefully</div>
                    <div className="text-xs text-blue-500 mt-1">1 hour ago</div>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 border-l-4 border-purple-500 rounded-lg">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">🎉</div>
                  <div>
                    <div className="text-sm font-semibold text-purple-800">System Update</div>
                    <div className="text-xs text-purple-600">New features available</div>
                    <div className="text-xs text-purple-500 mt-1">2 hours ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Quick Actions */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800">Quick Actions</h3>
            <div className="text-sm text-gray-500 font-medium">⚡ User Tools</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button 
              onClick={() => navigate('/traffic-status')}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
            >
              <div className="text-2xl mb-2">📊</div>
              Traffic Status
            </button>
            <button 
              onClick={() => navigate('/route-planner')}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
            >
              <div className="text-2xl mb-2">🗺️</div>
              Route Planner
            </button>
            <button 
              onClick={handleOpenReportModal}
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
            >
              <div className="text-2xl mb-2">📝</div>
              Report Issue
            </button>
          </div>
        </div>

        {/* Enhanced Traffic Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-green-200 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-6">
                  <div className="text-3xl font-bold text-gray-800">85%</div>
                  <div className="text-sm text-gray-600 font-medium">Traffic Flow</div>
                  <div className="text-xs text-green-600 mt-1">↑ 5% from yesterday</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-6">
                  <div className="text-3xl font-bold text-gray-800">12 min</div>
                  <div className="text-sm text-gray-600 font-medium">Avg Wait Time</div>
                  <div className="text-xs text-blue-600 mt-1">↓ 2 min from yesterday</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-6">
                  <div className="text-3xl font-bold text-gray-800">3</div>
                  <div className="text-sm text-gray-600 font-medium">Active Alerts</div>
                  <div className="text-xs text-purple-600 mt-1">2 new today</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Features Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Additional Features</h3>
            <p className="text-gray-600">Explore more tools to enhance your travel experience</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">🚗</div>
              <h4 className="font-semibold text-gray-800 mb-2">Parking Finder</h4>
              <p className="text-sm text-gray-600">Find available parking spots</p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">⛽</div>
              <h4 className="font-semibold text-gray-800 mb-2">Fuel Stations</h4>
              <p className="text-sm text-gray-600">Locate nearby gas stations</p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">🏥</div>
              <h4 className="font-semibold text-gray-800 mb-2">Emergency Services</h4>
              <p className="text-sm text-gray-600">Quick access to emergency contacts</p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">📱</div>
              <h4 className="font-semibold text-gray-800 mb-2">Mobile App</h4>
              <p className="text-sm text-gray-600">Download our mobile app</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Report Issue Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Report Traffic Issue</h2>
                <button
                  onClick={handleCloseReportModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Issue Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={reportForm.issueType}
                    onChange={(e) => handleFormChange('issueType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Select issue type</option>
                    <option value="traffic_jam">Traffic Jam</option>
                    <option value="accident">Accident</option>
                    <option value="road_construction">Road Construction</option>
                    <option value="broken_traffic_light">Broken Traffic Light</option>
                    <option value="road_damage">Road Damage</option>
                    <option value="flooding">Flooding</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={reportForm.location}
                    onChange={(e) => handleFormChange('location', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Select location</option>
                    <option value="north_junction">North Junction - Main Street</option>
                    <option value="east_junction">East Junction - Highway Exit</option>
                    <option value="south_junction">South Junction - City Center</option>
                    <option value="other">Other Location</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Severity Level
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => handleFormChange('severity', 'low')}
                      className={`py-3 px-4 rounded-xl transition-all duration-200 font-medium ${
                        reportForm.severity === 'low'
                          ? 'bg-green-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      🟢 Low
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFormChange('severity', 'medium')}
                      className={`py-3 px-4 rounded-xl transition-all duration-200 font-medium ${
                        reportForm.severity === 'medium'
                          ? 'bg-yellow-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      🟡 Medium
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFormChange('severity', 'high')}
                      className={`py-3 px-4 rounded-xl transition-all duration-200 font-medium ${
                        reportForm.severity === 'high'
                          ? 'bg-red-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      🔴 High
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reportForm.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    placeholder="Please provide detailed description of the issue..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact Information (Optional)
                  </label>
                  <input
                    type="email"
                    value={reportForm.contactInfo}
                    onChange={(e) => handleFormChange('contactInfo', e.target.value)}
                    placeholder="Your email for follow-up (optional)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    onClick={handleCloseReportModal}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitReport}
                    disabled={isSubmitting}
                    className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                      isSubmitting
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </div>
                    ) : (
                      'Submit Report'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default UserDashboard; 