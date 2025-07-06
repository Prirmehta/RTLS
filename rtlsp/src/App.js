import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, MapPin, Users, Truck, Settings, Package, Building } from 'lucide-react';

const PhantomTrailDashboard = () => {
  const [isLiveTracking, setIsLiveTracking] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState('forklifts');
  const [timeRange, setTimeRange] = useState('last-hour');
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedId, setSelectedId] = useState('FL-001');
  const [currentTime, setCurrentTime] = useState(0);
  const [trailData, setTrailData] = useState([]);
  
  const mapRef = useRef(null);
  
  // Mock data for different entities with comprehensive details
  const entityData = {
    forklifts: [
      { 
        id: 'FL-001', 
        name: 'Forklift Alpha', 
        status: 'Active', 
        zone: 'Asset Area',
        shift: 'Morning',
        distanceTravelled: '12.4 km',
        timeTaken: '2h 45m',
        idleTime: '15m',
        speed: '5.2 km/h',
        battery: '85%'
      },
      { 
        id: 'FL-002', 
        name: 'Forklift Beta', 
        status: 'Idle', 
        zone: 'Storage Area',
        shift: 'Morning',
        distanceTravelled: '8.7 km',
        timeTaken: '3h 12m',
        idleTime: '45m',
        speed: '0 km/h',
        battery: '92%'
      },
      { 
        id: 'FL-003', 
        name: 'Forklift Gamma', 
        status: 'Active', 
        zone: 'Random Racks',
        shift: 'Morning',
        distanceTravelled: '15.2 km',
        timeTaken: '4h 8m',
        idleTime: '8m',
        speed: '3.8 km/h',
        battery: '67%'
      }
    ],
    workers: [
      { 
        id: 'WK-001', 
        name: 'John Smith', 
        status: 'Active', 
        zone: 'Storage Area',
        shift: 'Morning',
        distanceTravelled: '3.2 km',
        timeTaken: '4h 15m',
        idleTime: '22m',
        speed: '4.1 km/h'
      },
      { 
        id: 'WK-002', 
        name: 'Sarah Johnson', 
        status: 'Break', 
        zone: 'Office',
        shift: 'Morning',
        distanceTravelled: '2.8 km',
        timeTaken: '3h 45m',
        idleTime: '1h 12m',
        speed: '0 km/h'
      },
      { 
        id: 'WK-003', 
        name: 'Mike Davis', 
        status: 'Active', 
        zone: 'Service Area',
        shift: 'Morning',
        distanceTravelled: '4.1 km',
        timeTaken: '3h 58m',
        idleTime: '18m',
        speed: '3.7 km/h'
      }
    ],
    cranes: [
      { 
        id: 'CR-001', 
        name: 'Overhead Crane 1', 
        status: 'Active', 
        zone: 'Asset Area',
        shift: 'Morning',
        distanceTravelled: '850 m',
        timeTaken: '5h 20m',
        idleTime: '35m',
        speed: '2.1 km/h',
        load: '2.5 tons',
        capacity: '10 tons'
      },
      { 
        id: 'CR-002', 
        name: 'Overhead Crane 2', 
        status: 'Maintenance', 
        zone: 'Service Area',
        shift: 'Morning',
        distanceTravelled: '0 m',
        timeTaken: '6h 0m',
        idleTime: '6h 0m',
        speed: '0 km/h',
        load: '0 tons',
        capacity: '15 tons'
      }
    ],
    carts: [
      { 
        id: 'CT-001', 
        name: 'Transport Cart A', 
        status: 'Active', 
        zone: 'Random Racks',
        shift: 'Morning',
        distanceTravelled: '18.5 km',
        timeTaken: '4h 30m',
        idleTime: '25m',
        speed: '6.2 km/h',
        load: '350 kg',
        route: 'Storage->Asset'
      },
      { 
        id: 'CT-002', 
        name: 'Transport Cart B', 
        status: 'Loading', 
        zone: 'Storage Area',
        shift: 'Morning',
        distanceTravelled: '14.2 km',
        timeTaken: '3h 45m',
        idleTime: '1h 5m',
        speed: '1.2 km/h',
        load: '180 kg',
        route: 'Asset->Office'
      }
    ]
  };

  // Mock trail points for animation
  const generateTrailPoints = () => {
    const points = [];
    for (let i = 0; i <= 100; i++) {
      const angle = (i / 100) * Math.PI * 2;
      const radius = 80 + Math.sin(i / 10) * 20;
      const x = 200 + Math.cos(angle) * radius;
      const y = 150 + Math.sin(angle) * radius;
      points.push({ x, y, time: i });
    }
    return points;
  };

  useEffect(() => {
    setTrailData(generateTrailPoints());
  }, [selectedId]);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return prev + 1;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleReset = () => {
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const getEntityIcon = (type) => {
    switch (type) {
      case 'forklifts': return <Truck className="w-4 h-4" />;
      case 'workers': return <Users className="w-4 h-4" />;
      case 'cranes': return <Settings className="w-4 h-4" />;
      case 'carts': return <Package className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'text-green-600';
      case 'Idle': return 'text-yellow-600';
      case 'Break': return 'text-blue-600';
      case 'Maintenance': return 'text-red-600';
      case 'Loading': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const currentPoint = trailData[Math.floor(currentTime)] || trailData[0];
  const currentTrail = trailData.slice(0, Math.floor(currentTime) + 1);

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">PHANTOM TRAIL</h1>
        <h2 className="text-2xl text-gray-600">WAREHOUSE</h2>
      </div>

      <div className="flex gap-6 h-[calc(100vh-200px)]">
        {/* Left Panel - 60% */}
        <div className="w-3/5 bg-gray-50 rounded-lg p-6 shadow-lg">
          {/* Map Grid */}
          <div className="bg-white rounded-lg p-4 mb-6 h-3/4 relative border-2 border-gray-200">
            <svg 
              ref={mapRef}
              className="w-full h-full"
              viewBox="0 0 600 400"
              style={{ backgroundColor: '#f8f9fa' }}
            >
              {/* Grid lines */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Areas */}
              {/* Asset Area */}
              <rect x="30" y="30" width="160" height="100" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" rx="5"/>
              <text x="110" y="50" textAnchor="middle" className="text-sm font-semibold fill-amber-700">Asset Area</text>
              {/* Asset Area Icons */}
              <g transform="translate(50, 65)">
                {/* Forklift */}
                <rect x="0" y="0" width="20" height="12" fill="#f59e0b" rx="2"/>
                <rect x="3" y="-3" width="8" height="6" fill="#d97706" rx="1"/>
                <circle cx="5" cy="15" r="3" fill="#374151"/>
                <circle cx="15" cy="15" r="3" fill="#374151"/>
                {/* Crane */}
                <rect x="30" y="8" width="3" height="20" fill="#dc2626"/>
                <rect x="25" y="8" width="13" height="3" fill="#dc2626"/>
                <rect x="25" y="5" width="3" height="6" fill="#991b1b"/>
                {/* Cart */}
                <rect x="50" y="5" width="15" height="10" fill="#059669" rx="2"/>
                <circle cx="53" cy="18" r="2" fill="#374151"/>
                <circle cx="62" cy="18" r="2" fill="#374151"/>
                <rect x="65" y="8" width="3" height="8" fill="#047857"/>
              </g>
              
              {/* Storage Area */}
              <rect x="220" y="30" width="180" height="100" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2" rx="5"/>
              <text x="310" y="50" textAnchor="middle" className="text-sm font-semibold fill-blue-700">Storage Area</text>
              {/* Storage Area Icons - Boxes on Racks */}
              <g transform="translate(240, 65)">
                {/* Rack 1 */}
                <rect x="0" y="0" width="25" height="35" fill="none" stroke="#374151" strokeWidth="1"/>
                <rect x="2" y="5" width="8" height="6" fill="#ef4444"/>
                <rect x="12" y="5" width="8" height="6" fill="#10b981"/>
                <rect x="2" y="15" width="8" height="6" fill="#3b82f6"/>
                <rect x="12" y="15" width="8" height="6" fill="#f59e0b"/>
                <rect x="2" y="25" width="8" height="6" fill="#8b5cf6"/>
                <rect x="12" y="25" width="8" height="6" fill="#ec4899"/>
                
                {/* Rack 2 */}
                <rect x="35" y="0" width="25" height="35" fill="none" stroke="#374151" strokeWidth="1"/>
                <rect x="37" y="5" width="8" height="6" fill="#06b6d4"/>
                <rect x="47" y="5" width="8" height="6" fill="#84cc16"/>
                <rect x="37" y="15" width="8" height="6" fill="#f97316"/>
                <rect x="47" y="15" width="8" height="6" fill="#6366f1"/>
                <rect x="37" y="25" width="8" height="6" fill="#14b8a6"/>
                
                {/* Rack 3 */}
                <rect x="70" y="0" width="25" height="35" fill="none" stroke="#374151" strokeWidth="1"/>
                <rect x="72" y="5" width="8" height="6" fill="#f43f5e"/>
                <rect x="82" y="5" width="8" height="6" fill="#22c55e"/>
                <rect x="72" y="15" width="8" height="6" fill="#3b82f6"/>
                <rect x="82" y="15" width="8" height="6" fill="#a855f7"/>
                <rect x="72" y="25" width="8" height="6" fill="#eab308"/>
                <rect x="82" y="25" width="8" height="6" fill="#ef4444"/>
              </g>
              
              {/* Office */}
              <rect x="430" y="30" width="140" height="100" fill="#f3e8ff" stroke="#8b5cf6" strokeWidth="2" rx="5"/>
              <text x="500" y="50" textAnchor="middle" className="text-sm font-semibold fill-purple-700">Office</text>
              {/* Office Icons - Table and Chairs */}
              <g transform="translate(460, 70)">
                {/* Table */}
                <rect x="20" y="10" width="40" height="25" fill="#92400e" rx="3"/>
                <rect x="22" y="8" width="36" height="2" fill="#78350f"/>
                {/* Table legs */}
                <rect x="24" y="35" width="2" height="8" fill="#92400e"/>
                <rect x="54" y="35" width="2" height="8" fill="#92400e"/>
                <rect x="24" y="10" width="2" height="8" fill="#92400e"/>
                <rect x="54" y="10" width="2" height="8" fill="#92400e"/>
                {/* Chairs */}
                <rect x="5" y="15" width="10" height="15" fill="#6b7280" rx="2"/>
                <rect x="5" y="15" width="10" height="3" fill="#4b5563"/>
                <rect x="65" y="15" width="10" height="15" fill="#6b7280" rx="2"/>
                <rect x="65" y="15" width="10" height="3" fill="#4b5563"/>
              </g>
              
              {/* Random Racks */}
              <rect x="30" y="160" width="240" height="80" fill="#ecfdf5" stroke="#10b981" strokeWidth="2" rx="5"/>
              <text x="150" y="180" textAnchor="middle" className="text-sm font-semibold fill-emerald-700">Random Racks</text>
              {/* Random rack icons */}
              <g transform="translate(50, 190)">
                <rect x="0" y="0" width="15" height="25" fill="none" stroke="#374151" strokeWidth="1"/>
                <rect x="2" y="3" width="5" height="4" fill="#ef4444"/>
                <rect x="8" y="3" width="5" height="4" fill="#3b82f6"/>
                <rect x="2" y="9" width="5" height="4" fill="#10b981"/>
                <rect x="8" y="18" width="5" height="4" fill="#f59e0b"/>
                
                <rect x="25" y="0" width="15" height="25" fill="none" stroke="#374151" strokeWidth="1"/>
                <rect x="27" y="3" width="5" height="4" fill="#8b5cf6"/>
                <rect x="33" y="3" width="5" height="4" fill="#ec4899"/>
                <rect x="27" y="18" width="5" height="4" fill="#06b6d4"/>
                
                <rect x="170" y="0" width="15" height="25" fill="none" stroke="#374151" strokeWidth="1"/>
                <rect x="172" y="3" width="5" height="4" fill="#84cc16"/>
                <rect x="178" y="9" width="5" height="4" fill="#f97316"/>
                <rect x="172" y="18" width="5" height="4" fill="#6366f1"/>
              </g>
              
              {/* Service Area */}
              <rect x="300" y="160" width="270" height="80" fill="#fce7f3" stroke="#ec4899" strokeWidth="2" rx="5"/>
              <text x="435" y="180" textAnchor="middle" className="text-sm font-semibold fill-pink-700">Service Area</text>
              {/* Service Equipment Icons */}
              <g transform="translate(320, 190)">
                {/* Tool Box */}
                <rect x="0" y="8" width="20" height="12" fill="#374151" rx="2"/>
                <rect x="2" y="6" width="16" height="4" fill="#6b7280" rx="1"/>
                <rect x="8" y="2" width="4" height="8" fill="#4b5563"/>
                {/* Wrench */}
                <rect x="30" y="10" width="15" height="3" fill="#9ca3af" rx="1"/>
                <circle cx="45" cy="11.5" r="4" fill="none" stroke="#9ca3af" strokeWidth="2"/>
                {/* Battery Charger */}
                <rect x="60" y="5" width="12" height="18" fill="#1f2937" rx="2"/>
                <rect x="62" y="7" width="8" height="3" fill="#10b981"/>
                <rect x="62" y="12" width="8" height="3" fill="#ef4444"/>
                <rect x="62" y="17" width="8" height="3" fill="#f59e0b"/>
                {/* Maintenance Tools */}
                <rect x="85" y="8" width="3" height="15" fill="#6b7280"/>
                <circle cx="86.5" cy="6" r="2" fill="#9ca3af"/>
                <rect x="95" y="10" width="12" height="2" fill="#374151"/>
                <rect x="95" y="14" width="12" height="2" fill="#374151"/>
                <circle cx="101" cy="8" r="2" fill="#6b7280"/>
                {/* Lift Equipment */}
                <rect x="120" y="12" width="25" height="3" fill="#dc2626"/>
                <rect x="130" y="5" width="3" height="18" fill="#dc2626"/>
                <rect x="125" y="15" width="5" height="5" fill="#991b1b"/>
                <rect x="135" y="15" width="5" height="5" fill="#991b1b"/>
                {/* Computer Terminal */}
                <rect x="160" y="8" width="18" height="12" fill="#1f2937" rx="1"/>
                <rect x="162" y="10" width="14" height="8" fill="#3b82f6"/>
                <rect x="165" y="20" width="8" height="2" fill="#6b7280"/>
                <rect x="165" y="22" width="8" height="1" fill="#9ca3af"/>
              </g>
              
              {/* Trail Path */}
              {currentTrail.length > 1 && (
                <path
                  d={`M ${currentTrail.map(p => `${p.x},${p.y}`).join(' L ')}`}
                  fill="none"
                  stroke="#ff6b6b"
                  strokeWidth="3"
                  strokeDasharray="5,5"
                  opacity="0.8"
                />
              )}
              
              {/* Start Point */}
              {trailData.length > 0 && (
                <circle
                  cx={trailData[0].x}
                  cy={trailData[0].y}
                  r="8"
                  fill="#22c55e"
                  stroke="white"
                  strokeWidth="2"
                />
              )}
              
              {/* Current Position */}
              {currentPoint && (
                <g>
                  <circle
                    cx={currentPoint.x}
                    cy={currentPoint.y}
                    r="12"
                    fill="#3b82f6"
                    stroke="white"
                    strokeWidth="3"
                  />
                  <circle
                    cx={currentPoint.x}
                    cy={currentPoint.y}
                    r="20"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    opacity="0.3"
                  />
                </g>
              )}
              
              {/* End Point */}
              {trailData.length > 0 && currentTime >= 100 && (
                <circle
                  cx={trailData[trailData.length - 1].x}
                  cy={trailData[trailData.length - 1].y}
                  r="8"
                  fill="#ef4444"
                  stroke="white"
                  strokeWidth="2"
                />
              )}
            </svg>
          </div>

          {/* Legends */}
          <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Map Legend</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-amber-200 border border-amber-500 rounded"></div>
                <span className="text-sm text-gray-700">Asset Area</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-200 border border-blue-500 rounded"></div>
                <span className="text-sm text-gray-700">Storage Area</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-200 border border-purple-500 rounded"></div>
                <span className="text-sm text-gray-700">Office</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-emerald-200 border border-emerald-500 rounded"></div>
                <span className="text-sm text-gray-700">Random Racks</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-pink-200 border border-pink-500 rounded"></div>
                <span className="text-sm text-gray-700">Service Area</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-red-400" style={{borderRadius: '2px'}}></div>
                <span className="text-sm text-gray-700">Trail Path</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Start Point</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-700">End Point</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - 40% */}
        <div className="w-2/5 bg-gray-50 rounded-lg p-6 shadow-lg">
          {/* Toggle Buttons */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsLiveTracking(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                isLiveTracking
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Live Tracking
            </button>
            <button
              onClick={() => setIsLiveTracking(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                !isLiveTracking
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Heatmap
            </button>
          </div>

          {/* Entity Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Entity Selection</label>
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="forklifts">Forklifts</option>
              <option value="workers">Workers</option>
              <option value="cranes">Cranes</option>
              <option value="carts">Carts</option>
            </select>
          </div>

          {/* Time Range Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="last-hour">Last Hour</option>
              <option value="24-hours">24 Hours</option>
              <option value="one-week">One Week</option>
            </select>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={handlePlay}
              disabled={isPlaying}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4" />
              Play
            </button>
            <button
              onClick={handlePause}
              disabled={!isPlaying}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Pause className="w-4 h-4" />
              Pause
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-100"
                style={{ width: `${currentTime}%` }}
              ></div>
            </div>
            <div className="text-center text-sm text-gray-600 mt-1">
              {currentTime}% Complete
            </div>
          </div>

          {/* Entity List */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              {selectedEntity.charAt(0).toUpperCase() + selectedEntity.slice(1)}
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {entityData[selectedEntity]?.map((entity) => (
                <button
                  key={entity.id}
                  onClick={() => setSelectedId(entity.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedId === entity.id
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getEntityIcon(selectedEntity)}
                      <span className="font-medium">{entity.id}</span>
                    </div>
                    <span className={`text-sm font-medium ${getStatusColor(entity.status)}`}>
                      {entity.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{entity.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Entity Details */}
          {selectedId && (
            <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Entity Details</h3>
              {(() => {
                const entity = entityData[selectedEntity]?.find(e => e.id === selectedId);
                if (!entity) return null;
                
                return (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{entity.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium ${getStatusColor(entity.status)}`}>
                        {entity.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Zone:</span>
                      <span className="font-medium">{entity.zone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shift:</span>
                      <span className="font-medium">{entity.shift}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Distance Travelled:</span>
                      <span className="font-medium text-blue-600">{entity.distanceTravelled}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time Taken:</span>
                      <span className="font-medium text-green-600">{entity.timeTaken}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Idle Time:</span>
                      <span className="font-medium text-orange-600">{entity.idleTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Speed:</span>
                      <span className="font-medium text-purple-600">{entity.speed}</span>
                    </div>
                    {/* Additional entity-specific details */}
                    {entity.battery && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Battery:</span>
                        <span className="font-medium text-yellow-600">{entity.battery}</span>
                      </div>
                    )}
                    {entity.load && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Load:</span>
                        <span className="font-medium text-red-600">{entity.load}</span>
                      </div>
                    )}
                    {entity.capacity && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Capacity:</span>
                        <span className="font-medium text-gray-600">{entity.capacity}</span>
                      </div>
                    )}
                    {entity.route && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Route:</span>
                        <span className="font-medium text-indigo-600">{entity.route}</span>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhantomTrailDashboard;