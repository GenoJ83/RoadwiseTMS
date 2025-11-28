import React, { useState, useRef } from 'react';

const LiveFeed = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const handleStartCamera = async () => {
    setError(null);
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (err) {
      setError('Unable to access camera. Please check your browser permissions and ensure no other app is using the camera.');
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
      } catch (err) {
        setError('Detection failed. Please try again.');
      } finally {
        setLoading(false);
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

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
      <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 24, boxShadow: '0 8px 32px rgba(30,60,114,0.2)', padding: 32, maxWidth: 520, width: '100%', margin: '2rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'box-shadow 0.3s' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1e3c72', marginBottom: 24, letterSpacing: 1 }}>Live Vehicle & Cyclist Detection</h1>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ width: '100%', maxWidth: 420, height: 260, borderRadius: 16, marginBottom: 16, boxShadow: '0 4px 16px rgba(30,60,114,0.10)', background: cameraActive ? 'none' : '#e3e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <video ref={videoRef} autoPlay style={{ width: '100%', height: '100%', borderRadius: 16, objectFit: 'cover', display: cameraActive ? 'block' : 'none' }} />
            {!cameraActive && (
              <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#1e3c72', fontWeight: 700, fontSize: 20, opacity: 0.7 }}>
                <span role="img" aria-label="camera" style={{ fontSize: 48, marginBottom: 12 }}>📷</span>
                Camera is off
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 16, width: '100%', justifyContent: 'center', marginBottom: 8 }}>
            {!cameraActive ? (
              <button onClick={handleStartCamera} style={{ flex: 1, padding: '12px 0', fontSize: 18, borderRadius: 10, background: 'linear-gradient(90deg, #1e3c72 0%, #2a5298 100%)', color: '#fff', border: 'none', fontWeight: 700, boxShadow: '0 2px 8px rgba(30,60,114,0.15)', cursor: 'pointer', transition: 'background 0.3s' }}>Start Camera</button>
            ) : (
              <>
                <button onClick={handleCapture} disabled={loading} style={{ flex: 1, padding: '12px 0', fontSize: 18, borderRadius: 10, background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)', color: '#fff', border: 'none', fontWeight: 700, boxShadow: '0 2px 8px rgba(67,206,162,0.15)', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.3s' }}>
                  {loading ? 'Detecting...' : 'Capture & Detect'}
                </button>
                <button onClick={handleStopCamera} style={{ flex: 1, padding: '12px 0', fontSize: 18, borderRadius: 10, background: 'linear-gradient(90deg, #ff512f 0%, #dd2476 100%)', color: '#fff', border: 'none', fontWeight: 700, boxShadow: '0 2px 8px rgba(255,81,47,0.10)', cursor: 'pointer', transition: 'background 0.3s' }}>Stop Camera</button>
              </>
            )}
          </div>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
        {result && (
          <div style={{ marginTop: 24, width: '100%', background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)', borderRadius: 12, padding: 24, color: '#fff', fontWeight: 700, fontSize: 20, textAlign: 'center', boxShadow: '0 2px 8px rgba(67,206,162,0.10)', transition: 'background 0.3s' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🚗 {result.vehicles} Vehicles</div>
            <div style={{ fontSize: 28 }}>🚴 {result.cyclists} Cyclists</div>
          </div>
        )}
        {error && (
          <div style={{ marginTop: 24, color: '#ff512f', fontWeight: 600, fontSize: 18 }}>{error}</div>
        )}
      </div>
    </div>
  );
};

export default LiveFeed; 