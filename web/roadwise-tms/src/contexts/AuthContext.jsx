import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((authData) => {
      if (authData) {
        setCurrentUser(authData.user);
        setUserData(authData.userData);
        setError(null);
      } else {
        setCurrentUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await authService.login(email, password);
      return result;
    } catch (error) {
      console.error('❌ Login failed:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (email, password, userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await authService.register(email, password, userData);
      return result;
    } catch (error) {
      console.error('❌ Registration failed:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      // The auth state listener will handle clearing the state
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (email) => {
    try {
      setError(null);
      await authService.resetPassword(email);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Update user profile
  const updateProfile = async (updateData) => {
    try {
      setError(null);
      await authService.updateUserProfile(currentUser.uid, updateData);
      setUserData(prev => ({ ...prev, ...updateData }));
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Check if user is officer
  const isOfficer = () => {
    return userData && userData.role === 'officer';
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!currentUser;
  };

  // Context value
  const value = {
    currentUser,
    userData,
    loading,
    error,
    login,
    register,
    logout,
    resetPassword,
    updateProfile,
    isOfficer,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 