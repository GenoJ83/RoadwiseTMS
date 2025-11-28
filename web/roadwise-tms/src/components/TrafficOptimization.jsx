import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';

const TrafficOptimization = () => {
  const [optimizationMode, setOptimizationMode] = useState('auto');
  const [trafficData, setTrafficData] = useState({
    north: { flow: 85, congestion: 'medium', waitTime: 8, vehicles: 45, cyclists: 12 },
    east: { flow: 65, congestion: 'low', waitTime: 4, vehicles: 32, cyclists: 8 },
    south: { flow: 45, congestion: 'high', waitTime: 15, vehicles: 78, cyclists: 5 }
  });
  const [optimizationHistory, setOptimizationHistory] = useState([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [optimizationSettings, setOptimizationSettings] = useState({
    priorityWeight: 0.5,
    flowWeight: 0.3,
    waitTimeWeight: 0.2,
    emergencyMode: false,
    pedestrianPriority: false,
    cyclistPriority: true
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate real-time traffic data updates
    const interval = setInterval(() => {
      setTrafficData(prev => ({
        north: {
          flow: Math.max(30, Math.min(95, prev.north.flow + (Math.random() - 0.5) * 10)),
          congestion: getCongestionLevel(prev.north.flow),
          waitTime: Math.max(2, Math.min(20, prev.north.waitTime + (Math.random() - 0.5) * 3)),
          vehicles: Math.max(20, Math.min(100, prev.north.vehicles + (Math.random() - 0.5) * 10)),
          cyclists: Math.max(5, Math.min(25, prev.north.cyclists + (Math.random() - 0.5) * 3))
        },
        east: {
          flow: Math.max(30, Math.min(95, prev.east.flow + (Math.random() - 0.5) * 10)),
          congestion: getCongestionLevel(prev.east.flow),
          waitTime: Math.max(2, Math.min(20, prev.east.waitTime + (Math.random() - 0.5) * 3)),
          vehicles: Math.max(20, Math.min(100, prev.east.vehicles + (Math.random() - 0.5) * 10)),
          cyclists: Math.max(5, Math.min(25, prev.east.cyclists + (Math.random() - 0.5) * 3))
        },
        south: {
          flow: Math.max(30, Math.min(95, prev.south.flow + (Math.random() - 0.5) * 10)),
          congestion: getCongestionLevel(prev.south.flow),
          waitTime: Math.max(2, Math.min(20, prev.south.waitTime + (Math.random() - 0.5) * 3)),
          vehicles: Math.max(20, Math.min(100, prev.south.vehicles + (Math.random() - 0.5) * 10)),
          cyclists: Math.max(5, Math.min(25, prev.south.cyclists + (Math.random() - 0.5) * 3))
        }
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getCongestionLevel = (flow) => {
    if (flow >= 80) return 'low';
    if (flow >= 60) return 'medium';
    return 'high';
  };

  const getCongestionColor = (congestion) => {
    switch (congestion) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
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

  const calculateOptimization = (mode, data) => {
    const improvements = {};
    
    Object.keys(data).forEach(junction => {
      const junctionData = data[junction];
      let improvement = 0;
      
      switch (mode) {
        case 'auto':
          // AI-powered optimization based on multiple factors
          improvement = Math.floor(
            (junctionData.flow * 0.4) + 
            ((100 - junctionData.waitTime * 5) * 0.3) + 
            (Math.random() * 20 * 0.3)
          );
          break;
        case 'congestion':
          // Focus on reducing congestion
          improvement = junctionData.congestion === 'high' ? 
            Math.floor(15 + Math.random() * 10) : 
            Math.floor(5 + Math.random() * 8);
          break;
        case 'flow':
          // Maximize traffic flow
          improvement = Math.floor(
            (junctionData.flow * 0.6) + 
            (Math.random() * 15 * 0.4)
          );
          break;
        case 'balanced':
          // Balance all factors
          improvement = Math.floor(
            (junctionData.flow * 0.3) + 
            ((100 - junctionData.waitTime * 5) * 0.4) + 
            (Math.random() * 12 * 0.3)
          );
          break;
        default:
          improvement = Math.floor(Math.random() * 15) + 5;
      }
      
      improvements[junction] = Math.max(5, Math.min(25, improvement));
    });
    
    return improvements;
  };

  const handleOptimization = () => {
    setIsOptimizing(true);
    
    // Simulate optimization process with realistic timing
    setTimeout(() => {
      const improvements = calculateOptimization(optimizationMode, trafficData);
      
      const newOptimization = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        type: optimizationMode,
        improvements,
        settings: { ...optimizationSettings },
        trafficSnapshot: { ...trafficData }
      };
      
      setOptimizationHistory(prev => [newOptimization, ...prev.slice(0, 9)]);
      setIsOptimizing(false);
      
      // Show success notification
      alert(`Optimization completed! Average improvement: ${Math.round(Object.values(improvements).reduce((a, b) => a + b, 0) / 3)}%`);
    }, 2000);
  };

  const handleAnalyzePatterns = () => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const analysis = {
        peakHours: {
          morning: '7:00 AM - 9:00 AM',
          evening: '5:00 PM - 7:00 PM'
        },
        bottlenecks: Object.entries(trafficData)
          .filter(([_, data]) => data.congestion === 'high')
          .map(([junction, _]) => junction),
        recommendations: [
          'Implement dynamic signal timing during peak hours',
          'Add dedicated cyclist lanes at high-cyclist junctions',
          'Consider traffic light synchronization with adjacent intersections',
          'Monitor and adjust for seasonal traffic patterns'
        ],
        efficiency: {
          overall: Math.round((Object.values(trafficData).reduce((sum, data) => sum + data.flow, 0) / 3)),
          congestion: Object.values(trafficData).filter(data => data.congestion === 'high').length,
          averageWait: Object.values(trafficData).reduce((sum, data) => sum + data.waitTime, 0) / 3
        }
      };
      
      setAnalysisResults(analysis);
      setIsAnalyzing(false);
    }, 3000);
  };

  const handleGenerateReport = () => {
    setIsGeneratingReport(true);
    
    setTimeout(() => {
      const report = {
        timestamp: new Date().toISOString(),
        summary: {
          totalOptimizations: optimizationHistory.length,
          averageImprovement: optimizationHistory.length > 0 ? 
            Math.round(optimizationHistory.reduce((sum, opt) => 
              sum + Object.values(opt.improvements).reduce((a, b) => a + b, 0) / 3, 0) / optimizationHistory.length) : 0,
          systemEfficiency: Math.round((Object.values(trafficData).reduce((sum, data) => sum + data.flow, 0) / 3))
        },
        recommendations: [
          'Continue monitoring South Junction for congestion patterns',
          'Implement AI-powered signal optimization during peak hours',
          'Consider infrastructure improvements for cyclist safety',
          'Establish emergency response protocols for traffic incidents'
        ]
      };
      
      // Simulate report download
      const reportBlob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(reportBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `traffic-optimization-report-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      setIsGeneratingReport(false);
      alert('Report generated and downloaded successfully!');
    }, 2500);
  };

  const optimizationModes = [
    { id: 'auto', name: 'Automatic AI', description: 'AI-powered optimization using machine learning algorithms', icon: '🤖' },
    { id: 'congestion', name: 'Congestion Relief', description: 'Focus on reducing congestion and wait times', icon: '🚦' },
    { id: 'flow', name: 'Flow Maximization', description: 'Maximize traffic flow and throughput', icon: '📈' },
    { id: 'balanced', name: 'Balanced Approach', description: 'Balance flow, wait time, and safety factors', icon: '⚖️' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Optimization Navigation */}
      <nav className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-xl border-b border-green-500">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg border-2 border-white border-opacity-30 bg-white">
                <img 
                  src="/logo.jpeg" 
                  alt="RoadWise TMS Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-2xl font-bold tracking-wide">RoadWise TMS</div>
                <div className="text-sm text-green-100 font-medium">Traffic Optimization</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard/officer')}
                className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Optimization Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 bg-white rounded-2xl shadow-xl p-8 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">AI Traffic Optimization</h1>
              <p className="text-gray-600">Intelligent traffic flow optimization using advanced algorithms</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">System Status</div>
              <div className="text-lg font-semibold text-green-600">🟢 Optimized</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Optimization Mode Selection */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Optimization Mode</h2>
            <div className="space-y-4">
              {optimizationModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setOptimizationMode(mode.id)}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
                    optimizationMode === mode.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{mode.icon}</div>
                    <div className="text-left">
                      <div className="text-lg font-semibold text-gray-800">{mode.name}</div>
                      <div className="text-sm text-gray-600">{mode.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Traffic Data */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Real-time Traffic Data</h2>
            <div className="space-y-4">
              {Object.entries(trafficData).map(([junction, data]) => (
                <div key={junction} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <span className="text-lg font-semibold text-gray-800 capitalize">{junction} Junction</span>
                      <div className="text-sm text-gray-600">
                        {junction === 'north' ? 'Main Street' : junction === 'east' ? 'Highway Exit' : 'City Center'}
                      </div>
                    </div>
                    <div className={`text-sm px-3 py-1 rounded-full border-2 font-semibold ${
                      data.congestion === 'low' ? 'bg-green-100 text-green-800 border-green-200' :
                      data.congestion === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                      'bg-red-100 text-red-800 border-red-200'
                    }`}>
                      {getCongestionIcon(data.congestion)} {data.congestion}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className={`text-xl font-bold ${getCongestionColor(data.congestion)}`}>
                        {Math.round(data.flow)}%
                      </div>
                      <div className="text-xs text-gray-600">Flow Rate</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-gray-800">{data.waitTime.toFixed(1)} min</div>
                      <div className="text-xs text-gray-600">Wait Time</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-blue-600">{data.vehicles}</div>
                      <div className="text-xs text-gray-600">Vehicles</div>
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <div className="text-sm text-gray-600">
                      🚴 {data.cyclists} cyclists
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Optimization Settings */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Optimization Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority Weight</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={optimizationSettings.priorityWeight}
                onChange={(e) => setOptimizationSettings(prev => ({ ...prev, priorityWeight: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-sm text-gray-600 mt-1">{optimizationSettings.priorityWeight}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Flow Weight</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={optimizationSettings.flowWeight}
                onChange={(e) => setOptimizationSettings(prev => ({ ...prev, flowWeight: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-sm text-gray-600 mt-1">{optimizationSettings.flowWeight}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Wait Time Weight</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={optimizationSettings.waitTimeWeight}
                onChange={(e) => setOptimizationSettings(prev => ({ ...prev, waitTimeWeight: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-sm text-gray-600 mt-1">{optimizationSettings.waitTimeWeight}</div>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="emergencyMode"
                checked={optimizationSettings.emergencyMode}
                onChange={(e) => setOptimizationSettings(prev => ({ ...prev, emergencyMode: e.target.checked }))}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="emergencyMode" className="text-sm font-medium text-gray-700">Emergency Mode</label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="pedestrianPriority"
                checked={optimizationSettings.pedestrianPriority}
                onChange={(e) => setOptimizationSettings(prev => ({ ...prev, pedestrianPriority: e.target.checked }))}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="pedestrianPriority" className="text-sm font-medium text-gray-700">Pedestrian Priority</label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="cyclistPriority"
                checked={optimizationSettings.cyclistPriority}
                onChange={(e) => setOptimizationSettings(prev => ({ ...prev, cyclistPriority: e.target.checked }))}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="cyclistPriority" className="text-sm font-medium text-gray-700">Cyclist Priority</label>
            </div>
          </div>
        </div>

        {/* Optimization Actions */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Optimization Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={handleOptimization}
              disabled={isOptimizing}
              className={`py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold ${
                isOptimizing
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
              }`}
            >
              <div className="text-2xl mb-2">{isOptimizing ? '⏳' : '🚀'}</div>
              {isOptimizing ? 'Optimizing...' : 'Run Optimization'}
            </button>
            
            <button
              onClick={handleAnalyzePatterns}
              disabled={isAnalyzing}
              className={`py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold ${
                isAnalyzing
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
              }`}
            >
              <div className="text-2xl mb-2">{isAnalyzing ? '⏳' : '📊'}</div>
              {isAnalyzing ? 'Analyzing...' : 'Analyze Patterns'}
            </button>
            
            <button
              onClick={handleGenerateReport}
              disabled={isGeneratingReport}
              className={`py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold ${
                isGeneratingReport
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700'
              }`}
            >
              <div className="text-2xl mb-2">{isGeneratingReport ? '⏳' : '📈'}</div>
              {isGeneratingReport ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>

        {/* Analysis Results */}
        {analysisResults && (
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Analysis Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Peak Hours</h3>
                <div className="text-sm text-gray-600">
                  <div>🌅 Morning: {analysisResults.peakHours.morning}</div>
                  <div>🌆 Evening: {analysisResults.peakHours.evening}</div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Bottlenecks</h3>
                <div className="text-sm text-gray-600">
                  {analysisResults.bottlenecks.length > 0 ? 
                    analysisResults.bottlenecks.map(b => <div key={b}>🔴 {b} Junction</div>) :
                    <div className="text-green-600">✅ No major bottlenecks</div>
                  }
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Efficiency</h3>
                <div className="text-sm text-gray-600">
                  <div>📊 Overall: {analysisResults.efficiency.overall}%</div>
                  <div>🚦 Congestion: {analysisResults.efficiency.congestion} junctions</div>
                  <div>⏱️ Avg Wait: {analysisResults.efficiency.averageWait.toFixed(1)} min</div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Recommendations</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  {analysisResults.recommendations.slice(0, 2).map((rec, index) => (
                    <div key={index}>• {rec}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Optimization History */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Optimization History</h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {optimizationHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">📊</div>
                <div className="text-lg font-semibold">No optimizations yet</div>
                <div className="text-sm">Run your first optimization to see results here</div>
              </div>
            ) : (
              optimizationHistory.map((optimization) => (
                <div key={optimization.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <div className="text-lg font-semibold text-gray-800">
                        {optimizationModes.find(m => m.id === optimization.type)?.name} Optimization
                      </div>
                      <div className="text-sm text-gray-600">{optimization.timestamp}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-green-600">✓ Completed</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-green-600">+{optimization.improvements.north}%</div>
                      <div className="text-xs text-gray-600">North Junction</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">+{optimization.improvements.east}%</div>
                      <div className="text-xs text-gray-600">East Junction</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">+{optimization.improvements.south}%</div>
                      <div className="text-xs text-gray-600">South Junction</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Insights */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-8 border border-purple-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">🤖 AI Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">🎯 Smart Recommendations</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Increase green time for South Junction during peak hours</li>
                <li>• Implement dynamic signal timing based on real-time data</li>
                <li>• Consider adding pedestrian crossing signals</li>
                <li>• Monitor cyclist flow patterns for optimization</li>
                <li>• Use machine learning to predict traffic patterns</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">📈 Performance Metrics</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Average wait time reduced by 23%</li>
                <li>• Traffic flow improved by 18%</li>
                <li>• Congestion incidents down by 35%</li>
                <li>• System efficiency at 94%</li>
                <li>• AI prediction accuracy: 87%</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default TrafficOptimization; 