import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import TrafficOfficerDashboard from '../components/TrafficOfficerDashboard';
import UserScheduler from '../components/UserScheduler';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      <Navigation />
      <main className="py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <Routes>
            <Route path="/officer" element={<TrafficOfficerDashboard />} />
            <Route path="/user" element={<UserScheduler />} />
            <Route path="*" element={<Navigate to="/dashboard/officer" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 