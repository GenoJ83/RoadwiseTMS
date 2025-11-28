import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Footer from './Footer';

const UserRegistration = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    vehicleType: '',
    licensePlate: '',
    emergencyContact: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, error: authError } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    if (formData.password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    try {
      // Prepare user data for Firebase
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phone,
        role: 'user', // Set role as user
        profile: {
          vehicleType: formData.vehicleType,
          licensePlate: formData.licensePlate,
          emergencyContact: formData.emergencyContact
        }
      };

      // Register with Firebase
      const result = await register(formData.email, formData.password, userData);
      
      // Wait a bit longer for auth state to be properly set
      setTimeout(() => {
        navigate('/dashboard/user');
      }, 500);

    } catch (error) {
      console.error('❌ UserRegistration: Registration error:', error);
      // Error is handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-green-700 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-8">
          {/* User Registration Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-xl overflow-hidden shadow-lg border border-green-200 mr-4">
                <img 
                  src="/logo.jpeg" 
                  alt="RoadWise TMS Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left">
                <h1 className="text-3xl font-bold text-gray-800">RoadWise TMS</h1>
                <p className="text-sm text-green-600 font-medium">User Registration</p>
              </div>
            </div>
            <p className="text-gray-600">Create your road user account</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {authError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {authError}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Type
              </label>
              <select
                name="vehicleType"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                value={formData.vehicleType}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Select Vehicle Type</option>
                <option value="car">Car</option>
                <option value="motorcycle">Motorcycle</option>
                <option value="truck">Truck</option>
                <option value="bus">Bus</option>
                <option value="bicycle">Bicycle</option>
                <option value="pedestrian">Pedestrian</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                License Plate (Optional)
              </label>
              <input
                type="text"
                name="licensePlate"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                value={formData.licensePlate}
                onChange={handleChange}
                placeholder="ABC-123"
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Emergency Contact
              </label>
              <input
                type="text"
                name="emergencyContact"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                value={formData.emergencyContact}
                onChange={handleChange}
                placeholder="Name and phone number"
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
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
                  Creating Account...
                </div>
              ) : (
                'Create User Account'
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login/user')}
                className="text-green-600 hover:text-green-800 font-medium"
                disabled={loading}
              >
                Sign In
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

export default UserRegistration; 