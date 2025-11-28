import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isOfficer = location.pathname.includes('/officer');
  const userRole = localStorage.getItem('userRole');
  const userEmail = localStorage.getItem('userEmail');

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-blue-900 to-emerald-900 text-white shadow-2xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="text-xl font-bold">RoadWise TMS</div>
                <div className="text-xs text-blue-200">Intelligent Traffic Management</div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-1 ml-8">
              <Link
                to="/dashboard/officer"
                className={`group relative px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                  isOfficer
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-blue-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Officer Control
                </span>
                {isOfficer && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"></div>
                )}
              </Link>
              
              <Link
                to="/dashboard/user"
                className={`group relative px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                  !isOfficer
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-blue-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Road User Portal
                </span>
                {!isOfficer && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"></div>
                )}
              </Link>
            </div>
          </div>

          {/* User Info and Logout */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-right">
              <div className="text-sm font-medium">
                {userRole === 'officer' ? 'Traffic Officer' : 'Road User'}
              </div>
              <div className="text-xs text-blue-200">{userEmail}</div>
            </div>
            
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>

            <button
              onClick={handleLogout}
              className="group bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/25 flex items-center"
            >
              <svg className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden mt-4 pt-4 border-t border-white/10">
          <div className="flex space-x-2">
            <Link
              to="/dashboard/officer"
              className={`flex-1 text-center px-3 py-2 rounded-lg font-medium transition-all duration-300 ${
                isOfficer
                  ? 'bg-white/20 text-white'
                  : 'text-blue-200 hover:text-white hover:bg-white/10'
              }`}
            >
              Officer Control
            </Link>
            <Link
              to="/dashboard/user"
              className={`flex-1 text-center px-3 py-2 rounded-lg font-medium transition-all duration-300 ${
                !isOfficer
                  ? 'bg-white/20 text-white'
                  : 'text-blue-200 hover:text-white hover:bg-white/10'
              }`}
            >
              Road User Portal
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 