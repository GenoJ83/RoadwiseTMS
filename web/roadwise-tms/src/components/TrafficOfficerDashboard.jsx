import React from 'react';
import TrafficLightControl from './TrafficLightControl';
import StatusDisplay from './StatusDisplay';
import AlertLog from './AlertLog';

const TrafficOfficerDashboard = () => {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <TrafficLightControl />
          <StatusDisplay />
        </div>
        <div>
          <AlertLog />
        </div>
      </div>
    </div>
  );
};

export default TrafficOfficerDashboard; 