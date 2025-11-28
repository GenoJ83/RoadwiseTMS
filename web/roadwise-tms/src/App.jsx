import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TrafficDataProvider } from './contexts/TrafficDataContext';
import LandingPage from './components/LandingPage';
import OfficerLogin from './components/OfficerLogin';
import UserLogin from './components/UserLogin';
import OfficerRegistration from './components/OfficerRegistration';
import UserRegistration from './components/UserRegistration';
import OfficerDashboard from './components/OfficerDashboard';
import UserDashboard from './components/UserDashboard';
import EmergencyMode from './components/EmergencyMode';
import TrafficOptimization from './components/TrafficOptimization';
import ReportGenerator from './components/ReportGenerator';
import TrafficStatus from './components/TrafficStatus';
import RoutePlanner from './components/RoutePlanner';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CookiePolicy from './pages/CookiePolicy';
import ImagePredictor from './components/ImagePredictor';
import LiveFeed from './pages/LiveFeed';

// Protected Route Component with Firebase Auth
const ProtectedRoute = ({ children, allowedRole }) => {
  const { userData, loading, isAuthenticated } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated()) {
    return <Navigate to={`/login/${allowedRole}`} replace />;
  }
  
  if (userData?.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Loading Component
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Initializing RoadWise TMS...</p>
    </div>
  </div>
);

// App Routes Component
const AppRoutes = () => {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/predict-image" element={<ImagePredictor />} />
      <Route path="/live-feed" element={<LiveFeed />} />
      <Route path="/login/officer" element={<OfficerLogin />} />
      <Route path="/login/user" element={<UserLogin />} />
      <Route path="/register/officer" element={<OfficerRegistration />} />
      <Route path="/register/user" element={<UserRegistration />} />
      
      {/* Legal Pages */}
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/cookie-policy" element={<CookiePolicy />} />
      
      {/* Protected Officer Routes */}
      <Route 
        path="/dashboard/officer" 
        element={
          <ProtectedRoute allowedRole="officer">
            <OfficerDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/emergency" 
        element={
          <ProtectedRoute allowedRole="officer">
            <EmergencyMode />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/optimization" 
        element={
          <ProtectedRoute allowedRole="officer">
            <TrafficOptimization />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/reports" 
        element={
          <ProtectedRoute allowedRole="officer">
            <ReportGenerator />
          </ProtectedRoute>
        } 
      />
      
      {/* Protected User Routes */}
      <Route 
        path="/dashboard/user" 
        element={
          <ProtectedRoute allowedRole="user">
            <UserDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/traffic-status" 
        element={
          <ProtectedRoute allowedRole="user">
            <TrafficStatus />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/route-planner" 
        element={
          <ProtectedRoute allowedRole="user">
            <RoutePlanner />
          </ProtectedRoute>
        } 
      />
      
      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <TrafficDataProvider>
        <Router>
          <div className="App">
            <AppRoutes />
          </div>
        </Router>
      </TrafficDataProvider>
    </AuthProvider>
  );
}

export default App;
