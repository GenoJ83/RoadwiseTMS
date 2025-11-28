import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Simple authentication logic
    if (email === 'officer@roadwise.com' && password === 'officer123') {
      localStorage.setItem('userRole', 'officer');
      localStorage.setItem('userEmail', email);
      onLogin && onLogin('officer');
      navigate('/dashboard/officer');
    } else if (email === 'user@roadwise.com' && password === 'user123') {
      localStorage.setItem('userRole', 'user');
      localStorage.setItem('userEmail', email);
      onLogin && onLogin('user');
      navigate('/dashboard/user');
    } else {
      setError('Invalid credentials. Please check your email and password.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">RoadWise TMS</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium"
          >
            Sign In
          </button>
        </form>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Test Credentials:</h3>
          <div className="text-xs text-gray-600 space-y-1">
            <p><strong>Officer:</strong> officer@roadwise.com / officer123</p>
            <p><strong>User:</strong> user@roadwise.com / user123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 