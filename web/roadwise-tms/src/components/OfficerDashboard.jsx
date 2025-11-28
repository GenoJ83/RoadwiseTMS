import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTrafficData } from '../contexts/TrafficDataContext';
import Footer from './Footer';
import DashboardNav from './DashboardNav';
import ImagePredictor from './ImagePredictor';
import DirectionLiveStream from './DirectionLiveStream';

const directions = ['north', 'east', 'south'];
const directionLabels = { north: 'North', east: 'East', south: 'South' };
const directionInitials = { north: 'N', east: 'E', south: 'S' };
const NODEMCU_IP = '192.168.16.83'; // <-- Set your NodeMCU's IP address here
const BACKEND_API = 'http://localhost:3001';

const OfficerDashboard = () => {
  const { userData, currentUser, isAuthenticated, logout } = useAuth();
  const {
    sensorData, setSensorData,
    trafficLights, setTrafficLights,
    currentPhase, setCurrentPhase,
    nextPhase, setNextPhase,
    phaseTimer, setPhaseTimer,
    isAutomaticMode, setIsAutomaticMode,
    cyclistPriority, setCyclistPriority,
    cyclistTimer, setCyclistTimer,
    priorityMode, setPriorityMode,
    priorityDirection, setPriorityDirection,
    getCongestionLevel,
    setPhaseCountdown,
    setPhaseType,
    backendTrafficState,
    overrideTrafficState,
  } = useTrafficData();
  const navigate = useNavigate();
  const [loading, setLoading] = useState({ north: false, east: false, south: false });
  const [error, setError] = useState({ north: null, east: null, south: null });
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [autoState, setAutoState] = useState({
    currentDir: 'north',
    phase: 'GREEN',
    countdown: 10
  });
  const [phaseQueue, setPhaseQueue] = useState(['north', 'east', 'south']);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login/officer');
      return;
    }
    if (userData && userData.role !== 'officer') {
      navigate('/');
      return;
    }
  }, [userData, currentUser, isAuthenticated, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleImageUpload = async (direction, file) => {
    setLoading(prev => ({ ...prev, [direction]: true }));
    setError(prev => ({ ...prev, [direction]: null }));
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await fetch('http://localhost:5000/detect-yolo', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setSensorData(prev => ({
        ...prev,
        [direction]: {
          vehicles: data.vehicles,
          cyclists: data.cyclists,
          congestion: getCongestionLevel(data.vehicles)
        }
      }));
      // Traffic light logic
      setTrafficLights(() => {
        // Priority: cyclists > highest congestion
        const hasCyclists = directions.find(dir =>
          dir === direction && data.cyclists > 0
        );
        if (hasCyclists) {
          // Cyclist priority: blue for cyclists, red for others
          return directions.reduce((acc, dir) => {
            acc[dir] = dir === direction
              ? { red: false, orange: false, blue: true, green: false }
              : { red: true, orange: false, blue: false, green: false };
            return acc;
          }, {});
        } else {
          // No cyclists: green for highest congestion
          // Find direction with highest congestion
          const allData = { ...sensorData, [direction]: {
            vehicles: data.vehicles,
            cyclists: data.cyclists,
            congestion: getCongestionLevel(data.vehicles)
          }};
          let maxVehicles = -1;
          let maxDir = 'north';
          directions.forEach(dir => {
            if (allData[dir].vehicles > maxVehicles) {
              maxVehicles = allData[dir].vehicles;
              maxDir = dir;
            }
          });
          return directions.reduce((acc, dir) => {
            acc[dir] = dir === maxDir
              ? { red: false, orange: false, blue: false, green: true }
              : { red: true, orange: false, blue: false, green: false };
            return acc;
          }, {});
        }
      });
    } catch (err) {
      setError(prev => ({ ...prev, [direction]: 'Detection failed. Please try again.' }));
    } finally {
      setLoading(prev => ({ ...prev, [direction]: false }));
    }
  };

  const getPriorityDirection = () => {
    const directions = Object.keys(sensorData);
    let maxCongestion = 0;
    let priorityDir = null;

    directions.forEach(direction => {
      const congestion = sensorData[direction].vehicles;
      if (congestion > maxCongestion) {
        maxCongestion = congestion;
        priorityDir = direction;
      }
    });

    return priorityDir;
  };

  const getPhaseDuration = (direction) => {
    const baseDuration = 30;
    const congestion = sensorData[direction].congestion;
    
    let duration = baseDuration;
    
    // Adjust duration based on congestion
    if (congestion === 'high') duration += 20;
    else if (congestion === 'medium') duration += 10;
    
    return duration;
  };

  const getNextPhase = (current) => {
    const phases = ['north', 'east', 'south'];
    const currentIndex = phases.indexOf(current);
    return phases[(currentIndex + 1) % phases.length];
  };

  // Helper to get the next two directions in order of congestion
  const getNextTwoDirections = (current) => {
    const others = directions.filter(dir => dir !== current);
    // Sort the other two by congestion (high to low)
    const sorted = others.sort((a, b) => {
      const aCong = sensorData[a]?.congestion === 'high' ? 3 : sensorData[a]?.congestion === 'medium' ? 2 : 1;
      const bCong = sensorData[b]?.congestion === 'high' ? 3 : sensorData[b]?.congestion === 'medium' ? 2 : 1;
      return bCong - aCong;
    });
    return sorted;
  };

  // On first run or when autoState.currentDir changes, set the queue to start with the current phase, then next two by congestion
  useEffect(() => {
    if (!isAutomaticMode) return;
    const [next, nextNext] = getNextTwoDirections(autoState.currentDir);
    setPhaseQueue([autoState.currentDir, next, nextNext]);
  }, [isAutomaticMode, autoState.currentDir, sensorData]);

  // --- Robust Frontend State Machine for Automatic Mode with Orange Transition ---
  useEffect(() => {
    if (!isAutomaticMode) return;
    let timer = null;
    let countdownInterval = null;

    // Helper to get phase duration
    const getGreenTime = (dir) => {
      let duration = 30;
      if (sensorData[dir]?.congestion === 'high') duration += 10;
      return duration;
    };

    // State machine runner
    const runPhase = (currentDir, phase, queue) => {
      if (!queue) queue = phaseQueue;
      if (phase === 'GREEN' || phase === 'BLUE') {
        const greenTime = getGreenTime(currentDir);
        setTrafficLights({
          north: { red: true, orange: false, blue: false, green: false },
          east: { red: true, orange: false, blue: false, green: false },
          south: { red: true, orange: false, blue: false, green: false }
        });
        setTrafficLights(prev => ({ ...prev, [currentDir]: {
          red: false,
          orange: false,
          blue: phase === 'BLUE',
          green: phase === 'GREEN'
        } }));
        setCurrentPhase(currentDir);
        setNextPhase(queue[1]);
        setAutoState({ currentDir, phase, countdown: greenTime });
        setPhaseCountdown(greenTime);
        setPhaseType(phase);
        sendLightCommand(currentDir, phase);
        timer = setTimeout(() => {
          runPhase(currentDir, 'RED', queue);
        }, greenTime * 1000);
      } else if (phase === 'RED') {
        setTrafficLights({
          north: { red: true, orange: false, blue: false, green: false },
          east: { red: true, orange: false, blue: false, green: false },
          south: { red: true, orange: false, blue: false, green: false }
        });
        setCurrentPhase(currentDir);
        setNextPhase(queue[1]);
        setAutoState({ currentDir, phase: 'RED', countdown: 1 });
        setPhaseCountdown(1);
        setPhaseType('RED');
        sendLightCommand(currentDir, 'RED');
        timer = setTimeout(() => {
          // Compute the next two directions for the new queue
          const [next, nextNext] = getNextTwoDirections(queue[0]);
          const newQueue = [next, nextNext, queue[0]];
          // Decide next phase (GREEN or BLUE)
          const nextPhase = (sensorData[next]?.cyclists > 0) ? 'BLUE' : 'GREEN';
          setPhaseQueue(newQueue);
          runPhase(next, nextPhase, newQueue);
        }, 1000);
      }
    };

    runPhase(phaseQueue[0], autoState.phase, phaseQueue);
    countdownInterval = setInterval(() => {
      setAutoState(prev => {
        const newCountdown = prev.countdown > 0 ? prev.countdown - 1 : 0;
        setPhaseCountdown(newCountdown);
        return { ...prev, countdown: newCountdown };
      });
    }, 1000);

    return () => {
      if (timer) clearTimeout(timer);
      if (countdownInterval) clearInterval(countdownInterval);
    };
  // eslint-disable-next-line
  }, [isAutomaticMode, sensorData]);

  // Cyclist priority timer
  useEffect(() => {
    if (!cyclistPriority || cyclistTimer <= 0) return;

    const interval = setInterval(() => {
      setCyclistTimer(prev => {
        if (prev <= 1) {
          // End cyclist priority and switch to green for the same junction
          setCyclistPriority(null);
          setTrafficLights(prevLights => {
            const newLights = { ...prevLights };
            newLights[currentPhase] = { red: false, orange: false, blue: false, green: true };
            return newLights;
          });
          setPhaseTimer(getPhaseDuration(currentPhase));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cyclistPriority, cyclistTimer, currentPhase, getPhaseDuration]);

  // Orange transition effect (separate useEffect)
  useEffect(() => {
    if (!isAutomaticMode) return;
    if (autoState.phase !== 'GREEN' && autoState.phase !== 'BLUE') return;
    if (autoState.countdown > 10) return;
    // Set orange for next direction
    const nextDir = (() => {
      const idx = directions.indexOf(autoState.currentDir);
      return directions[(idx + 1) % directions.length];
    })();
    setTrafficLights(prev => ({
      ...prev,
      [nextDir]: {
        ...prev[nextDir],
        orange: true,
        red: false,
        green: false,
        blue: false
      }
    }));
    sendLightCommand(nextDir, 'ORANGE');
    // Remove orange after 10s (when next phase starts)
    const orangeTimer = setTimeout(() => {
      setTrafficLights(prev => ({
        ...prev,
        [nextDir]: {
          ...prev[nextDir],
          orange: false
        }
      }));
    }, 10000);
    return () => clearTimeout(orangeTimer);
  }, [autoState.countdown, autoState.currentDir, autoState.phase, isAutomaticMode]);

  // Ensure orange light is always shown for next phase during current phase
  useEffect(() => {
    if (!isAutomaticMode || cyclistPriority) return;

    // Update traffic lights to show orange for next phase
    setTrafficLights(prevLights => {
      const newLights = {
        north: { red: true, orange: false, blue: false, green: false },
        east: { red: true, orange: false, blue: false, green: false },
        south: { red: true, orange: false, blue: false, green: false }
      };
      
      // Current phase gets green
      newLights[currentPhase] = { red: false, orange: false, blue: false, green: true };
      
      // Next phase gets orange (preparation)
      newLights[nextPhase] = { red: false, orange: true, blue: false, green: false };
      
      console.log('Orange light update - Current:', currentPhase, 'Next:', nextPhase, 'Lights:', newLights);
      return newLights;
    });
  }, [currentPhase, nextPhase, isAutomaticMode, cyclistPriority]);

  const toggleMode = () => {
    setIsAutomaticMode(!isAutomaticMode);
    if (!isAutomaticMode) {
      setCurrentPhase('north');
      setNextPhase('east');
      setPhaseTimer(30);
      setPriorityMode(false);
      setPriorityDirection(null);
      setCyclistPriority(null);
      setCyclistTimer(0);
      setTrafficLights({
        north: { red: false, orange: false, blue: false, green: true },
        east: { red: false, orange: true, blue: false, green: false },
        south: { red: true, orange: false, blue: false, green: false }
      });
    }
  };

  const setTrafficLight = (direction, light) => {
    if (isAutomaticMode) return;
    
    setTrafficLights(prev => {
      const newLights = { ...prev };
      newLights[direction] = { red: false, orange: false, blue: false, green: false };
      newLights[direction][light] = true;
      return newLights;
    });
  };

  const getTrafficLightColor = (direction, light) => {
    const isActive = trafficLights[direction][light];
    const colors = {
      red: isActive ? 'bg-red-600' : 'bg-gray-300',
      orange: isActive ? 'bg-orange-500' : 'bg-gray-300',
      blue: isActive ? 'bg-blue-600' : 'bg-gray-300',
      green: isActive ? 'bg-green-600' : 'bg-gray-300'
    };
    return colors[light];
  };

  const getTrafficLightGlow = (direction, light) => {
    const isActive = trafficLights[direction][light];
    if (!isActive) return '';
    
    const glowColors = {
      red: 'shadow-red-500',
      orange: 'shadow-orange-500',
      blue: 'shadow-blue-500',
      green: 'shadow-green-500'
    };
    return `shadow-lg ${glowColors[light]} shadow-opacity-50`;
  };

  const getCongestionColor = (congestion) => {
    switch (congestion) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCongestionIcon = (congestion) => {
    switch (congestion) {
      case 'low': return '🟢';
      case 'medium': return '🟡';
      case 'high': return '🔴';
      default: return '⚪';
    }
  };

  // Emergency Mode effect
  useEffect(() => {
    if (emergencyMode) {
      setTrafficLights({
        north: { red: true, orange: false, blue: false, green: false },
        east: { red: true, orange: false, blue: false, green: false },
        south: { red: true, orange: false, blue: false, green: false }
      });
      sendLightCommand('ALL', 'RED');
    }
  }, [emergencyMode, setTrafficLights]);

  // Helper to get the active color for a direction
  const getActiveColor = (lights) => {
    if (lights.green) return 'GREEN';
    if (lights.blue) return 'BLUE';
    if (lights.orange) return 'ORANGE';
    if (lights.red) return 'RED';
    return 'RED';
  };

  // Send light commands after every traffic light state change (auto/manual)
  useEffect(() => {
    if (emergencyMode) return; // Already handled above
    for (const dir of directions) {
      const color = getActiveColor(trafficLights[dir]);
      sendLightCommand(dir, color, sensorData[dir]?.vehicles ?? 0, sensorData[dir]?.cyclists ?? 0);
    }
  }, [trafficLights, sensorData, emergencyMode]);

  // Helper to send command to backend
  const sendLightCommand = async (direction, color, vehicles = 0, cyclists = 0) => {
    const dirKey = direction.toLowerCase();
    const initial = directionInitials[dirKey];
    if (!initial) {
      console.error('Invalid direction:', direction);
      return;
    }
    const payload = {
      junction: dirKey,
      command: `${initial}:${color.toUpperCase()}`
    };
    try {
      await fetch(`${BACKEND_API}/api/command/traffic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      // Optionally handle error (e.g., show notification)
      console.error('Failed to send command to backend:', err);
    }
  };

  if (userData && userData.role !== 'officer') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Floating Navigation */}
      <DashboardNav userType="officer" />

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
        {emergencyMode && (
          <div className="mb-8 bg-gradient-to-r from-red-500 to-red-700 rounded-2xl p-6 border border-red-400 flex items-center justify-center animate-pulse">
            <span className="text-white text-xl font-bold flex items-center gap-2">🚨 EMERGENCY MODE ACTIVE: All traffic lights are red. Click again to deactivate.</span>
          </div>
        )}
        {/* Enhanced Mode Toggle */}
        <div className="mb-8 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Traffic Control Mode</h3>
              <p className="text-gray-600">
                {isAutomaticMode ? '🤖 Intelligent mode is active - AI-powered traffic optimization' : '👤 Manual mode is active - Direct traffic light control'}
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className={`text-sm font-semibold ${isAutomaticMode ? 'text-green-600' : 'text-gray-400'}`}>
                  Intelligent
                </div>
                <div className="text-xs text-gray-500">AI Control</div>
              </div>
              <button
                onClick={toggleMode}
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-300 ${
                  isAutomaticMode ? 'bg-green-500' : 'bg-gray-300'
                } shadow-lg`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-all duration-300 shadow-md ${
                    isAutomaticMode ? 'translate-x-9' : 'translate-x-1'
                  }`}
                />
              </button>
              <div className="text-center">
                <div className={`text-sm font-semibold ${!isAutomaticMode ? 'text-blue-600' : 'text-gray-400'}`}>
                  Manual
                </div>
                <div className="text-xs text-gray-500">Direct Control</div>
              </div>
            </div>
          </div>
          
          {isAutomaticMode && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-800 mb-1">
                    {cyclistPriority ? cyclistTimer : autoState.countdown}s
                  </div>
                  <div className="text-sm text-green-600 font-medium">Time Remaining</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-800 mb-1 capitalize">
                    {autoState.currentDir} Direction
                  </div>
                  <div className="text-sm text-green-600 font-medium">Current Phase</div>
                  {priorityMode && (
                    <div className="mt-2 inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold">
                      🔥 Priority Mode
                    </div>
                  )}
                  {cyclistPriority && (
                    <div className="mt-2 inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                      🚴 Cyclist Priority
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-600 mb-1 capitalize">
                    {nextPhase} Direction
                  </div>
                  <div className="text-sm text-orange-600 font-medium">Next Phase (Orange)</div>
                </div>
              </div>
              
              {/* Enhanced Traffic Flow Indicator */}
              <div className="mt-6 p-4 bg-white rounded-lg border border-green-200">
                <div className="text-sm font-semibold text-gray-700 mb-3">Traffic Flow Sequence</div>
                <div className="flex items-center justify-center space-x-8">
                  {['north', 'east', 'south'].map((direction, index) => (
                    <div key={direction} className="flex flex-col items-center space-y-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        direction === autoState.currentDir ? 'bg-green-500 shadow-lg shadow-green-500/50' : 
                        direction === nextPhase ? 'bg-orange-500 shadow-lg shadow-orange-500/50' : 'bg-gray-300'
                      }`}>
                        {direction === autoState.currentDir ? 'G' : direction === nextPhase ? 'O' : 'R'}
                      </div>
                      <span className={`text-sm font-medium capitalize ${
                        direction === autoState.currentDir ? 'text-green-700' : 
                        direction === nextPhase ? 'text-orange-700' : 'text-gray-500'
                      }`}>
                        {direction}
                      </span>
                      {index < 2 && (
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enhanced Traffic Light Simulation */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-gray-800">Traffic Light Control</h3>
              <div className="text-sm text-gray-500 font-medium">
                {isAutomaticMode ? '🤖 Auto Mode' : '👤 Manual Mode'}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-8">
              {/* North Direction */}
              <div className="text-center">
                <div className="mb-6">
                  <h4 className="text-xl font-bold text-gray-800 mb-2">North Junction</h4>
                  <div className="text-sm text-gray-600">Main Street</div>
                  <div className="mt-2 inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                    Primary Route
                  </div>
                </div>
                
                {/* Enhanced Traffic Light Housing */}
                <div className="relative mx-auto">
                  {/* Traffic Light Pole */}
                  <div className="w-4 h-16 bg-gradient-to-b from-gray-600 to-gray-800 mx-auto rounded-t-lg shadow-lg"></div>
                  
                  {/* Traffic Light Housing */}
                  <div className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 w-28 mx-auto shadow-2xl border-2 border-gray-700 relative">
                    {/* Housing Top */}
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-gray-800 rounded-t-lg border-2 border-gray-700"></div>
                    
                    {/* Traffic Lights */}
                    <div className="space-y-4">
                      {/* Red Light */}
                      <div className="relative">
                        <div className={`w-16 h-16 rounded-full transition-all duration-500 ${getTrafficLightColor('north', 'red')} ${getTrafficLightGlow('north', 'red')} shadow-inner`}>
                          {trafficLights.north.red && (
                            <div className="absolute inset-0 rounded-full bg-red-400 opacity-30 animate-pulse"></div>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 font-medium">STOP</div>
                      </div>
                      
                      {/* Orange Light */}
                      <div className="relative">
                        <div className={`w-16 h-16 rounded-full transition-all duration-500 ${getTrafficLightColor('north', 'orange')} ${getTrafficLightGlow('north', 'orange')} shadow-inner`}>
                          {trafficLights.north.orange && (
                            <div className="absolute inset-0 rounded-full bg-orange-400 opacity-30 animate-pulse"></div>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 font-medium">WAIT</div>
                      </div>
                      
                      {/* Blue Light */}
                      <div className="relative">
                        <div className={`w-16 h-16 rounded-full transition-all duration-500 ${getTrafficLightColor('north', 'blue')} ${getTrafficLightGlow('north', 'blue')} shadow-inner`}>
                          {trafficLights.north.blue && (
                            <div className="absolute inset-0 rounded-full bg-blue-400 opacity-30 animate-pulse"></div>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 font-medium">CYCLISTS</div>
                      </div>
                      
                      {/* Green Light */}
                      <div className="relative">
                        <div className={`w-16 h-16 rounded-full transition-all duration-500 ${getTrafficLightColor('north', 'green')} ${getTrafficLightGlow('north', 'green')} shadow-inner`}>
                          {trafficLights.north.green && (
                            <div className="absolute inset-0 rounded-full bg-green-400 opacity-30 animate-pulse"></div>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 font-medium">GO</div>
                      </div>
                    </div>
                    
                    {/* Housing Bottom */}
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-4 bg-gray-800 rounded-b-lg border-2 border-gray-700"></div>
                  </div>
                  
                  {/* Base Plate */}
                  <div className="w-20 h-3 bg-gradient-to-r from-gray-700 to-gray-800 mx-auto rounded-b-lg shadow-lg mt-2"></div>
                </div>
                
                {/* Status Indicator */}
                <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-sm font-semibold text-gray-700 mb-2">Current Status</div>
                  <div className="flex items-center justify-center space-x-2">
                    {trafficLights.north.red && (
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                        <span className="text-xs text-red-600 font-medium">STOP</span>
                      </div>
                    )}
                    {trafficLights.north.orange && (
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-orange-500 rounded-full mr-1"></div>
                        <span className="text-xs text-orange-600 font-medium">WAIT</span>
                      </div>
                    )}
                    {trafficLights.north.blue && (
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                        <span className="text-xs text-blue-600 font-medium">CYCLISTS</span>
                      </div>
                    )}
                    {trafficLights.north.green && (
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                        <span className="text-xs text-green-600 font-medium">GO</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {!isAutomaticMode && (
                  <div className="mt-6 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setTrafficLight('north', 'red')}
                        className={`py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                          trafficLights.north.red 
                            ? 'bg-red-600 text-white shadow-red-500/50' 
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        🔴 STOP
                      </button>
                      <button
                        onClick={() => setTrafficLight('north', 'orange')}
                        className={`py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                          trafficLights.north.orange 
                            ? 'bg-orange-600 text-white shadow-orange-500/50' 
                            : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                        }`}
                      >
                        🟡 WAIT
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setTrafficLight('north', 'blue')}
                        className={`py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                          trafficLights.north.blue 
                            ? 'bg-blue-600 text-white shadow-blue-500/50' 
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        🔵 CYCLISTS
                      </button>
                      <button
                        onClick={() => setTrafficLight('north', 'green')}
                        className={`py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                          trafficLights.north.green 
                            ? 'bg-green-600 text-white shadow-green-500/50' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        🟢 GO
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* East Direction */}
              <div className="text-center">
                <div className="mb-6">
                  <h4 className="text-xl font-bold text-gray-800 mb-2">East Junction</h4>
                  <div className="text-sm text-gray-600">Highway Exit</div>
                  <div className="mt-2 inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
                    Secondary Route
                  </div>
                </div>
                
                {/* Enhanced Traffic Light Housing */}
                <div className="relative mx-auto">
                  {/* Traffic Light Pole */}
                  <div className="w-4 h-16 bg-gradient-to-b from-gray-600 to-gray-800 mx-auto rounded-t-lg shadow-lg"></div>
                  
                  {/* Traffic Light Housing */}
                  <div className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 w-28 mx-auto shadow-2xl border-2 border-gray-700 relative">
                    {/* Housing Top */}
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-gray-800 rounded-t-lg border-2 border-gray-700"></div>
                    
                    {/* Traffic Lights */}
                    <div className="space-y-4">
                      {/* Red Light */}
                      <div className="relative">
                        <div className={`w-16 h-16 rounded-full transition-all duration-500 ${getTrafficLightColor('east', 'red')} ${getTrafficLightGlow('east', 'red')} shadow-inner`}>
                          {trafficLights.east.red && (
                            <div className="absolute inset-0 rounded-full bg-red-400 opacity-30 animate-pulse"></div>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 font-medium">STOP</div>
                      </div>
                      
                      {/* Orange Light */}
                      <div className="relative">
                        <div className={`w-16 h-16 rounded-full transition-all duration-500 ${getTrafficLightColor('east', 'orange')} ${getTrafficLightGlow('east', 'orange')} shadow-inner`}>
                          {trafficLights.east.orange && (
                            <div className="absolute inset-0 rounded-full bg-orange-400 opacity-30 animate-pulse"></div>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 font-medium">WAIT</div>
                      </div>
                      
                      {/* Blue Light */}
                      <div className="relative">
                        <div className={`w-16 h-16 rounded-full transition-all duration-500 ${getTrafficLightColor('east', 'blue')} ${getTrafficLightGlow('east', 'blue')} shadow-inner`}>
                          {trafficLights.east.blue && (
                            <div className="absolute inset-0 rounded-full bg-blue-400 opacity-30 animate-pulse"></div>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 font-medium">CYCLISTS</div>
                      </div>
                      
                      {/* Green Light */}
                      <div className="relative">
                        <div className={`w-16 h-16 rounded-full transition-all duration-500 ${getTrafficLightColor('east', 'green')} ${getTrafficLightGlow('east', 'green')} shadow-inner`}>
                          {trafficLights.east.green && (
                            <div className="absolute inset-0 rounded-full bg-green-400 opacity-30 animate-pulse"></div>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 font-medium">GO</div>
                      </div>
                    </div>
                    
                    {/* Housing Bottom */}
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-4 bg-gray-800 rounded-b-lg border-2 border-gray-700"></div>
                  </div>
                  
                  {/* Base Plate */}
                  <div className="w-20 h-3 bg-gradient-to-r from-gray-700 to-gray-800 mx-auto rounded-b-lg shadow-lg mt-2"></div>
                </div>
                
                {/* Status Indicator */}
                <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-sm font-semibold text-gray-700 mb-2">Current Status</div>
                  <div className="flex items-center justify-center space-x-2">
                    {trafficLights.east.red && (
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                        <span className="text-xs text-red-600 font-medium">STOP</span>
                      </div>
                    )}
                    {trafficLights.east.orange && (
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-orange-500 rounded-full mr-1"></div>
                        <span className="text-xs text-orange-600 font-medium">WAIT</span>
                      </div>
                    )}
                    {trafficLights.east.blue && (
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                        <span className="text-xs text-blue-600 font-medium">CYCLISTS</span>
                      </div>
                    )}
                    {trafficLights.east.green && (
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                        <span className="text-xs text-green-600 font-medium">GO</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {!isAutomaticMode && (
                  <div className="mt-6 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setTrafficLight('east', 'red')}
                        className={`py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                          trafficLights.east.red 
                            ? 'bg-red-600 text-white shadow-red-500/50' 
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        🔴 STOP
                      </button>
                      <button
                        onClick={() => setTrafficLight('east', 'orange')}
                        className={`py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                          trafficLights.east.orange 
                            ? 'bg-orange-600 text-white shadow-orange-500/50' 
                            : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                        }`}
                      >
                        🟡 WAIT
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setTrafficLight('east', 'blue')}
                        className={`py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                          trafficLights.east.blue 
                            ? 'bg-blue-600 text-white shadow-blue-500/50' 
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        🔵 CYCLISTS
                      </button>
                      <button
                        onClick={() => setTrafficLight('east', 'green')}
                        className={`py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                          trafficLights.east.green 
                            ? 'bg-green-600 text-white shadow-green-500/50' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        🟢 GO
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* South Direction */}
              <div className="text-center">
                <div className="mb-6">
                  <h4 className="text-xl font-bold text-gray-800 mb-2">South Junction</h4>
                  <div className="text-sm text-gray-600">City Center</div>
                  <div className="mt-2 inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold">
                    Urban Route
                  </div>
                </div>
                
                {/* Enhanced Traffic Light Housing */}
                <div className="relative mx-auto">
                  {/* Traffic Light Pole */}
                  <div className="w-4 h-16 bg-gradient-to-b from-gray-600 to-gray-800 mx-auto rounded-t-lg shadow-lg"></div>
                  
                  {/* Traffic Light Housing */}
                  <div className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 w-28 mx-auto shadow-2xl border-2 border-gray-700 relative">
                    {/* Housing Top */}
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-gray-800 rounded-t-lg border-2 border-gray-700"></div>
                    
                    {/* Traffic Lights */}
                    <div className="space-y-4">
                      {/* Red Light */}
                      <div className="relative">
                        <div className={`w-16 h-16 rounded-full transition-all duration-500 ${getTrafficLightColor('south', 'red')} ${getTrafficLightGlow('south', 'red')} shadow-inner`}>
                          {trafficLights.south.red && (
                            <div className="absolute inset-0 rounded-full bg-red-400 opacity-30 animate-pulse"></div>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 font-medium">STOP</div>
                      </div>
                      
                      {/* Orange Light */}
                      <div className="relative">
                        <div className={`w-16 h-16 rounded-full transition-all duration-500 ${getTrafficLightColor('south', 'orange')} ${getTrafficLightGlow('south', 'orange')} shadow-inner`}>
                          {trafficLights.south.orange && (
                            <div className="absolute inset-0 rounded-full bg-orange-400 opacity-30 animate-pulse"></div>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 font-medium">WAIT</div>
                      </div>
                      
                      {/* Blue Light */}
                      <div className="relative">
                        <div className={`w-16 h-16 rounded-full transition-all duration-500 ${getTrafficLightColor('south', 'blue')} ${getTrafficLightGlow('south', 'blue')} shadow-inner`}>
                          {trafficLights.south.blue && (
                            <div className="absolute inset-0 rounded-full bg-blue-400 opacity-30 animate-pulse"></div>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 font-medium">CYCLISTS</div>
                      </div>
                      
                      {/* Green Light */}
                      <div className="relative">
                        <div className={`w-16 h-16 rounded-full transition-all duration-500 ${getTrafficLightColor('south', 'green')} ${getTrafficLightGlow('south', 'green')} shadow-inner`}>
                          {trafficLights.south.green && (
                            <div className="absolute inset-0 rounded-full bg-green-400 opacity-30 animate-pulse"></div>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 font-medium">GO</div>
                      </div>
                    </div>
                    
                    {/* Housing Bottom */}
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-4 bg-gray-800 rounded-b-lg border-2 border-gray-700"></div>
                  </div>
                  
                  {/* Base Plate */}
                  <div className="w-20 h-3 bg-gradient-to-r from-gray-700 to-gray-800 mx-auto rounded-b-lg shadow-lg mt-2"></div>
                </div>
                
                {/* Status Indicator */}
                <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-sm font-semibold text-gray-700 mb-2">Current Status</div>
                  <div className="flex items-center justify-center space-x-2">
                    {trafficLights.south.red && (
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                        <span className="text-xs text-red-600 font-medium">STOP</span>
                      </div>
                    )}
                    {trafficLights.south.orange && (
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-orange-500 rounded-full mr-1"></div>
                        <span className="text-xs text-orange-600 font-medium">WAIT</span>
                      </div>
                    )}
                    {trafficLights.south.blue && (
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                        <span className="text-xs text-blue-600 font-medium">CYCLISTS</span>
                      </div>
                    )}
                    {trafficLights.south.green && (
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                        <span className="text-xs text-green-600 font-medium">GO</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {!isAutomaticMode && (
                  <div className="mt-6 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setTrafficLight('south', 'red')}
                        className={`py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                          trafficLights.south.red 
                            ? 'bg-red-600 text-white shadow-red-500/50' 
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        🔴 STOP
                      </button>
                      <button
                        onClick={() => setTrafficLight('south', 'orange')}
                        className={`py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                          trafficLights.south.orange 
                            ? 'bg-orange-600 text-white shadow-orange-500/50' 
                            : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                        }`}
                      >
                        🟡 WAIT
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setTrafficLight('south', 'blue')}
                        className={`py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                          trafficLights.south.blue 
                            ? 'bg-blue-600 text-white shadow-blue-500/50' 
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        🔵 CYCLISTS
                      </button>
                      <button
                        onClick={() => setTrafficLight('south', 'green')}
                        className={`py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                          trafficLights.south.green 
                            ? 'bg-green-600 text-white shadow-green-500/50' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        🟢 GO
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Traffic Light Legend */}
            <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">Traffic Light Legend</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-red-600 rounded-full shadow-lg shadow-red-500/50"></div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">Red</div>
                    <div className="text-xs text-gray-600">Stop</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-orange-500 rounded-full shadow-lg shadow-orange-500/50"></div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">Orange</div>
                    <div className="text-xs text-gray-600">Wait</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full shadow-lg shadow-blue-500/50"></div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">Blue</div>
                    <div className="text-xs text-gray-600">Cyclists</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-600 rounded-full shadow-lg shadow-green-500/50"></div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">Green</div>
                    <div className="text-xs text-gray-600">Go</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Sensor Data and Traffic Status */}
          <div className="space-y-8">
            {/* Real-time Sensor Data */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Real-time Sensor Data</h3>
                <div className="text-sm text-gray-500 font-medium">🔄 Live Updates</div>
              </div>
              <div className="space-y-4">
                {Object.entries(sensorData).map(([direction, data]) => (
                  <div key={direction} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <span className="text-lg font-semibold text-gray-800 capitalize">{direction} Junction</span>
                        <div className="text-sm text-gray-600">
                          {direction === 'north' ? 'Main Street' : direction === 'east' ? 'Highway Exit' : 'City Center'}
                        </div>
                      </div>
                      <div className={`text-sm px-4 py-2 rounded-full border-2 font-semibold ${getCongestionColor(data.congestion)}`}>
                        {getCongestionIcon(data.congestion)} {data.congestion} congestion
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800">{data.vehicles}</div>
                        <div className="text-sm text-gray-600">Vehicles</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{data.cyclists}</div>
                        <div className="text-sm text-gray-600">Cyclists</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Alert Log */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">System Alerts</h3>
                <div className="text-sm text-gray-500 font-medium">📊 Status Monitor</div>
              </div>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {priorityMode && (
                  <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-lg">
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">🔥</div>
                      <div>
                        <div className="text-sm font-semibold text-red-800">Priority Mode Active</div>
                        <div className="text-xs text-red-600">Extended green time for {priorityDirection} direction due to high congestion</div>
                      </div>
                    </div>
                  </div>
                )}
                {cyclistPriority && (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 rounded-lg">
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">🚴</div>
                      <div>
                        <div className="text-sm font-semibold text-blue-800">Cyclist Priority Active</div>
                        <div className="text-xs text-blue-600">Blue light active for {cyclistPriority} direction - {cyclistTimer}s remaining</div>
                      </div>
                    </div>
                  </div>
                )}
                {Object.entries(sensorData).map(([direction, data]) => (
                  data.cyclists > 0 && (
                    <div key={direction} className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 rounded-lg">
                      <div className="flex items-center">
                        <div className="text-2xl mr-3">🚴</div>
                        <div>
                          <div className="text-sm font-semibold text-blue-800">Cyclists Detected</div>
                          <div className="text-xs text-blue-600">{data.cyclists} cyclists at {direction} junction</div>
                        </div>
                      </div>
                    </div>
                  )
                ))}
                <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 border-l-4 border-orange-500 rounded-lg">
                  <div className="flex items-center">
                    <div className="text-2xl mr-3">🟡</div>
                    <div>
                      <div className="text-sm font-semibold text-orange-800">Transition Phase</div>
                      <div className="text-xs text-orange-600">Orange light active for {nextPhase} direction (next phase)</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-500 rounded-lg">
                  <div className="flex items-center">
                    <div className="text-2xl mr-3">⚠️</div>
                    <div>
                      <div className="text-sm font-semibold text-yellow-800">Congestion Building</div>
                      <div className="text-xs text-yellow-600">East Junction - Expect delays</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 rounded-lg">
                  <div className="flex items-center">
                    <div className="text-2xl mr-3">✅</div>
                    <div>
                      <div className="text-sm font-semibold text-green-800">System Update</div>
                      <div className="text-xs text-green-600">Traffic lights synchronized - 10 minutes ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Quick Actions */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800">Quick Actions</h3>
            <div className="text-sm text-gray-500 font-medium">⚡ Emergency Controls</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <button 
              onClick={() => setEmergencyMode(em => !em)}
              className={`bg-gradient-to-r from-red-500 to-red-600 text-white py-4 px-6 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold ${emergencyMode ? 'ring-4 ring-red-400' : ''}`}
            >
              <div className="text-2xl mb-2">🚨</div>
              {emergencyMode ? 'Deactivate Emergency' : 'Activate Emergency Mode'}
            </button>
            <button 
              onClick={() => navigate('/optimization')}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
            >
              <div className="text-2xl mb-2">🚦</div>
              Optimize Flow
            </button>
            <button 
              onClick={() => navigate('/reports')}
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
            >
              <div className="text-2xl mb-2">📊</div>
              Generate Report
            </button>
            <button 
              onClick={toggleMode}
              className={`py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold ${
                isAutomaticMode 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700' 
                  : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700'
              }`}
            >
              <div className="text-2xl mb-2">{isAutomaticMode ? '👤' : '🤖'}</div>
              {isAutomaticMode ? 'Switch to Manual' : 'Switch to Auto'}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Unified Container for Detector and Image Upload */}
      <div className="mt-8 bg-white rounded-2xl shadow-xl p-8 max-w-7xl w-full mx-auto flex flex-col items-stretch gap-0 px-6">
        <h2 className="text-base font-bold text-blue-900 mb-6 text-center">Real-time Traffic Image Upload & Control</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {directions.map(direction => (
            <DirectionLiveStream
              key={direction}
              direction={direction}
              directionLabel={directionLabels[direction]}
              loading={loading[direction]}
              error={error[direction]}
              sensorData={sensorData[direction]}
              trafficLight={trafficLights[direction]}
              handleImageUpload={file => handleImageUpload(direction, file)}
            />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OfficerDashboard; 