import React, { useEffect, useState } from 'react';

const mockAlerts = [
  {
    id: 1,
    message: 'North set to Green at Lat: 12.345678, Lon: 98.765432',
    timestamp: '2025-06-12 08:00:00',
  },
  {
    id: 2,
    message: 'East set to Red at Lat: 12.345678, Lon: 98.765432',
    timestamp: '2025-06-12 08:05:00',
  },
];

const AlertLog = () => {
  const [alerts, setAlerts] = useState(mockAlerts);

  useEffect(() => {
    const interval = setInterval(() => {
      setAlerts(mockAlerts);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-lg font-semibold mb-4">Alert Log</h3>
      <ul className="space-y-2">
        {alerts.map(alert => (
          <li key={alert.id} className="border-b pb-2">
            <div className="text-sm">{alert.message}</div>
            <div className="text-xs text-gray-500">{alert.timestamp}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AlertLog; 