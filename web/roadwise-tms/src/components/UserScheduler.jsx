import React, { useState } from 'react';

const days = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
];
const starts = ['Kampala', 'Entebbe'];
const destinations = ['North', 'East', 'South'];

const mockRecommendation = {
  time: '8:00 AM',
  route: 'via North',
  congestion: 0.3,
};

const UserScheduler = () => {
  const [form, setForm] = useState({ start: '', destination: '', day: '' });
  const [result, setResult] = useState(null);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    setResult(mockRecommendation);
    console.log('sendSMSCommand: Recommendation sent');
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Travel Time Scheduler</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Start Location</label>
            <select
              name="start"
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              value={form.start}
              onChange={handleChange}
              required
            >
              <option value="">Select start location</option>
              {starts.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Destination</label>
            <select
              name="destination"
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              value={form.destination}
              onChange={handleChange}
              required
            >
              <option value="">Select destination</option>
              {destinations.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Day</label>
            <select
              name="day"
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              value={form.day}
              onChange={handleChange}
              required
            >
              <option value="">Select day</option>
              {days.map(day => <option key={day} value={day}>{day}</option>)}
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded font-semibold hover:bg-green-700 transition mt-6"
          >
            Get Travel Recommendation
          </button>
        </form>
        {result && (
          <div className="mt-6 p-4 bg-green-50 rounded border border-green-200">
            <h3 className="font-semibold text-green-800 mb-2">Travel Recommendation</h3>
            <div className="text-green-700">
              <p><strong>Recommended time:</strong> {result.time}</p>
              <p><strong>Route:</strong> {result.route}</p>
              <p><strong>Expected congestion:</strong> {result.congestion}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserScheduler; 