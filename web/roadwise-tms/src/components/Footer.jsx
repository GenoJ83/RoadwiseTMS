import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-lg overflow-hidden shadow-lg border border-white border-opacity-20">
                <img 
                  src="/logo.jpeg" 
                  alt="RoadWise TMS Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold">RoadWise TMS</h3>
                <p className="text-sm text-gray-300">Intelligent Traffic Management System</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Advanced traffic control and monitoring with real-time data analysis, 
              automated signal optimization, and comprehensive user management.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => handleNavigation('/traffic-status')}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Live Traffic Updates
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('/route-planner')}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Route Assistance
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('/emergency')}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Emergency Support
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('/reports')}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  System Reports
                </button>
              </li>
              <li>
                <a href="mailto:support@roadwise-tms.com" className="text-gray-300 hover:text-white transition-colors">
                  Contact Support
                </a>
              </li>
              <li>
                <span className="text-gray-300 text-sm">
                  Kampala Capital City
                </span>
              </li>
              <li>
                <span className="text-gray-300 text-sm">
                  +256-781-642-869
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-300 text-sm">
              © {currentYear} RoadWise TMS. All rights reserved.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <button 
                onClick={() => handleNavigation('/privacy-policy')}
                className="text-gray-300 hover:text-white text-sm transition-colors"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => handleNavigation('/terms-of-service')}
                className="text-gray-300 hover:text-white text-sm transition-colors"
              >
                Terms of Service
              </button>
              <button 
                onClick={() => handleNavigation('/cookie-policy')}
                className="text-gray-300 hover:text-white text-sm transition-colors"
              >
                Cookie Policy
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 