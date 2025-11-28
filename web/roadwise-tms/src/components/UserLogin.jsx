import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Footer from './Footer';

const UserLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, error: authError, currentUser, userData, isAuthenticated } = useAuth();

  // Monitor auth state changes and navigate when ready
  useEffect(() => {
    if (isAuthenticated() && userData && userData.role === 'user') {
      navigate('/dashboard/user', { replace: true });
    }
  }, [currentUser, userData, isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await login(email, password);
      
      // Check if user is a regular user
      if (result.userData.role === 'user') {
        // Navigation will be handled by useEffect
      } else {
        // User is not a regular user, show error
        throw new Error('Access denied. This portal is for road users only.');
      }
    } catch (error) {
      console.error('❌ UserLogin: Login error:', error);
      // Error is handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col">
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden shadow-lg">
                <img 
                  src="/logo.jpeg" 
                  alt="RoadWise TMS Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Road User Login</h2>
            <p className="mt-2 text-sm text-gray-600">
              Access traffic information and route planning
            </p>
          </div>

          {/* Login Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {authError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {authError}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Email
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>
            
            <button
              type="submit"
              className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In as User'
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register/user')}
                className="text-green-600 hover:text-green-800 font-medium"
                disabled={loading}
              >
                Create Account
              </button>
            </p>
          </div>

          <div className="text-center mt-4">
            <button
              onClick={() => navigate('/')}
              className="text-green-600 hover:text-green-800 text-sm"
              disabled={loading}
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default UserLogin; 