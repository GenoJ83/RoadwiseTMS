import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrafficData } from '../contexts/TrafficDataContext';

const ImagePredictor = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  let stream = null;
  const navigate = useNavigate();
  const { setSensorData, getCongestionLevel } = useTrafficData();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await fetch('http://localhost:5000/detect-yolo', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setResult(data);
      setSensorData(prev => ({
        ...prev,
        north: {
          vehicles: data.vehicles,
          cyclists: data.cyclists,
          congestion: getCongestionLevel(data.vehicles)
        }
      }));
    } catch (err) {
      setError('Detection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLiveFeed = () => {
    navigate('/live-feed');
  };

  const handleStartCamera = async () => {
    setError(null);
    setResult(null);
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      setError('Unable to access camera.');
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      setLoading(true);
      setError(null);
      setResult(null);
      try {
        const formData = new FormData();
        formData.append('image', blob, 'capture.jpg');
        const response = await fetch('http://localhost:5000/detect-yolo', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        setResult(data);
        setSensorData(prev => ({
          ...prev,
          north: {
            vehicles: data.vehicles,
            cyclists: data.cyclists,
            congestion: getCongestionLevel(data.vehicles)
          }
        }));
      } catch (err) {
        setError('Detection failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 'image/jpeg');
  };

  const handleStopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-3 w-full flex flex-col items-center" style={{ minHeight: 0 }}>
      <h2 className="text-2xl font-bold text-blue-900 mb-4">Vehicle & Cyclist Detector</h2>
      <form onSubmit={handleSubmit} className="w-full flex flex-col items-center mb-2">
        <input type="file" accept="image/*" onChange={handleFileChange} className="mb-2 p-1 w-full text-xs" style={{ height: 28 }} />
        <button type="submit" disabled={!file || loading} className="py-1 px-4 rounded bg-blue-500 text-white font-semibold text-xs shadow hover:bg-blue-600 transition-all duration-200 cursor-pointer w-full" style={{ height: 28 }}>
          {loading ? 'Detecting...' : 'Detect'}
        </button>
      </form>
      <div className="w-full flex flex-col items-center mb-1">
        <span className="text-gray-500 font-medium text-xs mb-1">or</span>
        <button onClick={handleGoToLiveFeed} className="py-1 px-4 rounded bg-gray-200 text-blue-700 font-semibold text-xs shadow hover:bg-blue-100 transition-all duration-200 cursor-pointer w-full" style={{ height: 28 }}>
          Live Feed
        </button>
      </div>
      {result && (
        <div className="mt-2 w-full bg-blue-50 rounded text-blue-900 text-xs font-bold text-center py-2 px-1">
          🚗 {result.vehicles} | 🚴 {result.cyclists}
        </div>
      )}
      {error && (
        <div className="mt-1 text-red-600 text-xs font-semibold text-center">{error}</div>
      )}
    </div>
  );
};

export default ImagePredictor; 