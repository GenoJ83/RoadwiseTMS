import React, { useEffect, useState } from 'react';

const mockStatus = {
  North: { state: 'Red', congestion: 0.3, greenTime: 15.0, cyclists: false },
  East: { state: 'Red', congestion: 0.2, greenTime: 10.0, cyclists: true },
  South: { state: 'Red', congestion: 0.1, greenTime: 12.0, cyclists: false },
};

const StatusDisplay = () => {
  const [status, setStatus] = useState(mockStatus);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(mockStatus);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mb-6 p-4 bg-white rounded shadow">
      <h3 className="text-lg font-semibold mb-4">Junction Status</h3>
      <table className="w-full text-left">
        <thead>
          <tr>
            <th>Direction</th>
            <th>State</th>
            <th>Congestion</th>
            <th>Green Time (s)</th>
            <th>Cyclists</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(status).map(([dir, data]) => (
            <tr key={dir}>
              <td className="font-bold">{dir}</td>
              <td>{data.state}</td>
              <td>{data.congestion}</td>
              <td>{data.greenTime}</td>
              <td>{data.cyclists ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StatusDisplay; 