import React from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: 'url(/Landing.jpeg)' }}
    >
      {/* Enhanced overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      
      {/* Floating Navigation */}
      <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-black bg-opacity-60 backdrop-blur-xl rounded-2xl border border-white border-opacity-20 shadow-2xl">
        <div className="px-8 py-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg border border-white border-opacity-20">
              <img 
                src="/logo.jpeg" 
                alt="RoadWise TMS Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white drop-shadow-lg">RoadWise TMS</span>
              <span className="text-xs text-blue-200 font-medium">Intelligent Traffic Management</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-2xl">
            Intelligent Traffic Management System
          </h1>
          <p className="text-xl text-white mb-12 max-w-3xl mx-auto drop-shadow-lg font-medium">
            Advanced traffic control and monitoring with real-time data analysis, 
            automated signal optimization, and comprehensive user management.
          </p>
        </div>

        {/* Login Options */}
        <div className="relative z-10 max-w-4xl mx-auto mt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Officer Login Card */}
            <div className="bg-black bg-opacity-40 backdrop-blur-lg rounded-xl p-8 border-2 border-blue-400 border-opacity-50 shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">Traffic Officer Portal</h3>
                <p className="text-blue-100 font-medium drop-shadow-md">Access traffic control dashboard and management tools</p>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center text-blue-100 font-medium">
                  <svg className="w-5 h-5 text-blue-300 mr-3 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Traffic light control
                </div>
                <div className="flex items-center text-blue-100 font-medium">
                  <svg className="w-5 h-5 text-blue-300 mr-3 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Real-time monitoring
                </div>
                <div className="flex items-center text-blue-100 font-medium">
                  <svg className="w-5 h-5 text-blue-300 mr-3 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Emergency controls
                </div>
              </div>
              
              <button
                onClick={() => navigate('/login/officer')}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-medium transition-colors mb-3 shadow-lg drop-shadow-md"
              >
                Officer Login
              </button>
              
              <button
                onClick={() => navigate('/register/officer')}
                className="w-full bg-transparent border-2 border-blue-400 text-blue-200 py-2 px-6 rounded-lg hover:bg-blue-600 hover:text-white font-medium transition-colors drop-shadow-sm"
              >
                Create Officer Account
              </button>
            </div>

            {/* User Login Card */}
            <div className="bg-black bg-opacity-40 backdrop-blur-lg rounded-xl p-8 border-2 border-green-400 border-opacity-50 shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">Road User Portal</h3>
                <p className="text-green-100 font-medium drop-shadow-md">Access travel planning and traffic information</p>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center text-green-100 font-medium">
                  <svg className="w-5 h-5 text-green-300 mr-3 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Route planning
                </div>
                <div className="flex items-center text-green-100 font-medium">
                  <svg className="w-5 h-5 text-green-300 mr-3 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Traffic alerts
                </div>
                <div className="flex items-center text-green-100 font-medium">
                  <svg className="w-5 h-5 text-green-300 mr-3 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Real-time updates
                </div>
              </div>
              
              <button
                onClick={() => navigate('/login/user')}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-medium transition-colors mb-3 shadow-lg drop-shadow-md"
              >
                User Login
              </button>
              
              <button
                onClick={() => navigate('/register/user')}
                className="w-full bg-transparent border-2 border-green-400 text-green-200 py-2 px-6 rounded-lg hover:bg-green-600 hover:text-white font-medium transition-colors drop-shadow-sm"
              >
                Create User Account
              </button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="relative z-10 mt-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12 drop-shadow-2xl">System Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center bg-black bg-opacity-40 backdrop-blur-lg rounded-xl p-6 border-2 border-blue-400 border-opacity-30 shadow-2xl">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2 drop-shadow-lg">Smart Traffic Control</h3>
              <p className="text-blue-100 font-medium drop-shadow-md">AI-powered traffic signal optimization for efficient flow</p>
            </div>
            
            <div className="text-center bg-black bg-opacity-40 backdrop-blur-lg rounded-xl p-6 border-2 border-green-400 border-opacity-30 shadow-2xl">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2 drop-shadow-lg">Real-time Monitoring</h3>
              <p className="text-green-100 font-medium drop-shadow-md">Live traffic data and instant alert notifications</p>
            </div>
            
            <div className="text-center bg-black bg-opacity-40 backdrop-blur-lg rounded-xl p-6 border-2 border-purple-400 border-opacity-30 shadow-2xl">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2 drop-shadow-lg">User Management</h3>
              <p className="text-purple-100 font-medium drop-shadow-md">Separate portals for officers and road users</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage; 