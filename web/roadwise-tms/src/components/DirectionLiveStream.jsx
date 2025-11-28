import React, { useRef, useState } from 'react';

const DirectionLiveStream = ({
  direction,
  directionLabel,
  loading,
  error,
  sensorData,
  trafficLight,
  handleImageUpload
}) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [result, setResult] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const handleStartCamera = async () => {
    setLocalError(null);
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (err) {
      setLocalError('Unable to access camera.');
      setCameraActive(false);
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
      setLocalLoading(true);
      setLocalError(null);
      setResult(null);
      try {
        await handleImageUpload(blob);
      } catch (err) {
        setLocalError('Detection failed.');
      } finally {
        setLocalLoading(false);
      }
    }, 'image/jpeg');
  };

  const handleStopCamera = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLocalLoading(true);
    setLocalError(null);
    setResult(null);
    try {
      await handleImageUpload(file);
    } catch (err) {
      setLocalError('Detection failed.');
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center bg-gray-50 rounded-lg shadow-sm p-3">
      <h3 className="text-sm font-semibold text-blue-800 mb-1">{directionLabel}</h3>
      <div className="w-full flex flex-col items-center mb-2">
        <div className="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden mb-2">
          <video ref={videoRef} autoPlay className="w-full h-full object-cover rounded-lg" style={{ display: cameraActive ? 'block' : 'none' }} />
          {!cameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-blue-900 opacity-60 font-bold text-lg">
              <span role="img" aria-label="camera" className="text-3xl mb-1">📷</span>
              Camera is off
            </div>
          )}
        </div>
        <div className="flex gap-2 w-full justify-center mb-1">
          {!cameraActive ? (
            <button onClick={handleStartCamera} className="flex-1 py-1 px-2 rounded bg-blue-500 text-white text-xs font-semibold shadow hover:bg-blue-600 transition-all duration-200">Start Camera</button>
          ) : (
            <>
              <button onClick={handleCapture} disabled={localLoading} className="flex-1 py-1 px-2 rounded bg-green-500 text-white text-xs font-semibold shadow hover:bg-green-600 transition-all duration-200 disabled:opacity-60">{localLoading ? 'Detecting...' : 'Capture & Detect'}</button>
              <button onClick={handleStopCamera} className="flex-1 py-1 px-2 rounded bg-red-500 text-white text-xs font-semibold shadow hover:bg-red-600 transition-all duration-200">Stop</button>
            </>
          )}
        </div>
        <div className="flex w-full justify-center mb-1">
          <input
            type="file"
            accept="image/*"
            id={`upload-${direction}`}
            className="hidden"
            onChange={handleFileChange}
            disabled={localLoading}
          />
          <label
            htmlFor={`upload-${direction}`}
            className={`flex-1 py-1 px-2 rounded bg-blue-500 text-white text-xs font-semibold shadow hover:bg-blue-600 transition-all duration-200 text-center cursor-pointer ${localLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
            style={{ marginBottom: 0 }}
          >
            {localLoading ? 'Detecting...' : 'Upload Image'}
          </label>
        </div>
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
      <div className="w-full flex flex-col items-center">
        {error && <div className="text-red-600 font-semibold text-xs mb-1">{error}</div>}
        {localError && <div className="text-red-600 font-semibold text-xs mb-1">{localError}</div>}
        <div className="font-semibold text-gray-700 text-xs mb-1">
          🚗 {sensorData?.vehicles ?? 0} | 🚴 {sensorData?.cyclists ?? 0}
        </div>
        <div className="font-bold text-xs mt-1">
          {trafficLight?.blue && <span className="text-blue-600">CYCLIST</span>}
          {trafficLight?.green && <span className="text-green-600">GO</span>}
          {trafficLight?.red && <span className="text-red-600">STOP</span>}
          {trafficLight?.orange && <span className="text-orange-500">WAIT</span>}
        </div>
      </div>
    </div>
  );
};

export default DirectionLiveStream; 