
import React, { useState, useEffect, useRef } from 'react';
import {
  FaPlay,
  FaPause,
  FaRedo,
  FaFire,
  FaMapMarkerAlt,
  FaClock,
  FaTimes,
  FaTruck,
  FaCog,
  FaShoppingCart,
  FaUserCog,
  FaExpand,
  FaCompress,
  FaSearchPlus,
  FaSearchMinus,
  FaMoon,
  FaSun,
} from 'react-icons/fa';
import { RiSpeedUpFill } from "react-icons/ri";
import { Link, useLocation } from 'react-router-dom';

const LiveTrailDashboard = () => {
  // ... keep existing code (all state variables and refs)
  const [view, setView] = useState('live');
  const location = useLocation();

  const [assetType, setAssetType] = useState('Forklifts');
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [checkedAssets, setCheckedAssets] = useState(new Set());
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [trailTime, setTrailTime] = useState(0);
  const [timeRange, setTimeRange] = useState('1 Hour');
  const [scale, setScale] = useState(1); // Default zoom out a little
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMidPanel, setShowMidPanel] = useState(false);
  const [midPanelAsset, setMidPanelAsset] = useState(null);
  const intervalRef = useRef(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [allAssetsPaths, setAllAssetsPaths] = useState({});
  const [checkedAssetsPaths, setCheckedAssetsPaths] = useState({});
  const [trailPath, setTrailPath] = useState([]);

  // ... keep existing code (theme configuration and all utility functions)
  const theme = {
    background: darkMode ? '#1A1A1A' : '#f9f9f9',
    cardBackground: darkMode ? '#1A1A1A' : '#ffffff',
    textPrimary: darkMode ? '#ffffff' : '#003366',
    textSecondary: darkMode ? '#b0b0b0' : '#5c7ea3',
    border: darkMode ? '#404040' : '#ccc',
    shadow: darkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.05)',
    mapBackground: darkMode ? '#1a1a1a' : '#ffffff',
    gridColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
  };

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));
  const handleFullScreenToggle = () => setIsFullScreen(prev => !prev);
  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const handleStartPlayback = () => {
    console.log("Playback started from:", startDate, "to", endDate);
  };

  const handleStopPlayback = () => {
    console.log("Playback stopped.");
  };

  const assetMap = {
    Forklifts: ['Forklift A', 'Forklift B'],
    Cranes: ['Crane A', 'Crane B'],
    Carts: ['Cart X', 'Cart Y'],
    'Operators/Workers': ['Worker 1', 'Worker 2'],
    'All Assets': ['Forklift A', 'Crane A', 'Cart X', 'Worker 1'],
  };

  const ZONES = [
    { name: "Asset Area", x: 70, y: 75 },
    { name: "Storage Area 1", x: 295, y: 120 },
    { name: "Storage Area 2", x: 595, y: 165 },
    { name: "Service Area", x: 710, y: 345 },
    { name: "Receiving Dock", x: 160, y: 400 },
    { name: "Shipping Dock", x: 430, y: 400 },
    { name: "Office", x: 50, y: 195 },
    { name: "Canteen", x: 50, y: 260 },
  ];

  function getRandomZoneStart() {
    const zone = ZONES[Math.floor(Math.random() * ZONES.length)];
    return { x: zone.x, y: zone.y };
  }

  function getNearestZoneEndpoint(currentX, currentY) {
    let nearest = ZONES[0];
    let minDist = Infinity;
    ZONES.forEach((zone) => {
      const dist = Math.sqrt(
        Math.pow(currentX - zone.x, 2) + Math.pow(currentY - zone.y, 2)
      );
      if (dist < minDist) {
        minDist = dist;
        nearest = zone;
      }
    });
    return { x: nearest.x, y: nearest.y, zoneName: nearest.name };
  }

  function generateRandomPath(assetId, occupiedCoords = new Set()) {
    const path = [];
    const stepSize = 30;
    let { x, y } = getRandomZoneStart();
    path.push({ x, y });
    occupiedCoords.add(`${x},${y}`);

    const isValid = (nx, ny) =>
      nx >= 10 &&
      nx <= 790 &&
      ny >= 10 &&
      ny <= 490 &&
      !occupiedCoords.has(`${nx},${ny}`);

    // Generate forward-moving path through different zones
    const visitedZones = new Set();
    let currentZoneIndex = ZONES.findIndex(zone => Math.abs(zone.x - x) < 30 && Math.abs(zone.y - y) < 30);
    if (currentZoneIndex !== -1) visitedZones.add(currentZoneIndex);

    for (let i = 0; i < 30; i++) {
      // Try to move towards a new zone that hasn't been visited
      let targetZone = null;
      const unvisitedZones = ZONES.filter((_, index) => !visitedZones.has(index));
      
      if (unvisitedZones.length > 0) {
        targetZone = unvisitedZones[Math.floor(Math.random() * unvisitedZones.length)];
        const zoneIndex = ZONES.indexOf(targetZone);
        visitedZones.add(zoneIndex);
      }

      let directions;
      if (targetZone) {
        // Move towards the target zone
        const dx = targetZone.x > x ? stepSize : targetZone.x < x ? -stepSize : 0;
        const dy = targetZone.y > y ? stepSize : targetZone.y < y ? -stepSize : 0;
        directions = [
          { dx, dy },
          { dx: stepSize, dy: 0 },
          { dx: -stepSize, dy: 0 },
          { dx: 0, dy: stepSize },
          { dx: 0, dy: -stepSize },
          { dx: stepSize, dy: stepSize },
          { dx: -stepSize, dy: stepSize },
          { dx: stepSize, dy: -stepSize },
          { dx: -stepSize, dy: -stepSize }
        ];
      } else {
        directions = [
          { dx: stepSize, dy: 0 },
          { dx: -stepSize, dy: 0 },
          { dx: 0, dy: stepSize },
          { dx: 0, dy: -stepSize },
          { dx: stepSize, dy: stepSize },
          { dx: -stepSize, dy: stepSize },
          { dx: stepSize, dy: -stepSize },
          { dx: -stepSize, dy: -stepSize }
        ];
      }

      const shuffled = directions.sort(() => 0.5 - Math.random());
      let moved = false;

      for (const dir of shuffled) {
        const nx = x + dir.dx;
        const ny = y + dir.dy;
        if (isValid(nx, ny)) {
          x = nx;
          y = ny;
          path.push({ x, y });
          occupiedCoords.add(`${x},${y}`);
          moved = true;
          break;
        }
      }

      if (!moved) {
        break;
      }
    }

    const end = getNearestZoneEndpoint(x, y);
    path.push({ x: end.x, y: end.y, popup: true, zoneName: end.zoneName });
    occupiedCoords.add(`${end.x},${end.y}`);

    return path;
  }

  const handleCheckboxChange = (assetId, checked) => {
    const newCheckedAssets = new Set(checkedAssets);
    const newCheckedAssetsPaths = { ...checkedAssetsPaths };

    if (checked) {
      newCheckedAssets.add(assetId);
      newCheckedAssetsPaths[assetId] = generateRandomPath(assetId);
    } else {
      newCheckedAssets.delete(assetId);
      delete newCheckedAssetsPaths[assetId];
    }

    setCheckedAssets(newCheckedAssets);
    setCheckedAssetsPaths(newCheckedAssetsPaths);
  };

  const initializeAllAssetsPaths = () => {
    const paths = {};
    assetMap['All Assets'].forEach((id) => {
      paths[id] = generateRandomPath(id);
    });
    setAllAssetsPaths(paths);
  };

  const getTrailColor = (type = assetType) => {
    switch (type) {
      case 'Forklifts':
      case 'Forklift A':
      case 'Forklift B':
        return '#800080';
      case 'Cranes':
      case 'Crane A':
      case 'Crane B':
        return '#ff6600';
      case 'Carts':
      case 'Cart X':
      case 'Cart Y':
        return '#ff69b4';
      case 'Operators/Workers':
      case 'Worker 1':
      case 'Worker 2':
        return '#f1c40f';
      default:
        return '#007bff';
    }
  };

  // ... keep existing code (useEffect hooks)
  useEffect(() => {
    setTrailPath(generateRandomPath());
  }, []);

  useEffect(() => {
    if (assetType === 'All Assets') {
      initializeAllAssetsPaths();
    } else {
      setAllAssetsPaths({});
    }
  }, [assetType]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          const maxLength =
            assetType === 'All Assets'
              ? Math.min(...Object.values(allAssetsPaths).map((p) => p.length))
              : trailPath.length;

          if (prev < maxLength - 1) {
            setTrailTime((t) => t + 1);
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 1000 / speed);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, speed, allAssetsPaths, trailPath]);

  const resetTrail = () => {
    setIsPlaying(false);
    setTrailTime(0);
    setCurrentIndex(0);
    setTrailPath(generateRandomPath());
    setSelectedAssetId(null);
    setMidPanelAsset(null);
    setShowMidPanel(false);
    if (assetType === 'All Assets') {
      initializeAllAssetsPaths();
    }
  };

  const handleAssetTypeChange = (newType) => {
    setIsPlaying(false);
    setCurrentIndex(0);
    setTrailTime(0);
    setTrailPath(generateRandomPath());
    setAssetType(newType);
    setSelectedAssetId(null);
    setMidPanelAsset(null);
    setShowMidPanel(false);
    setCheckedAssets(new Set());
    setCheckedAssetsPaths({});
    if (newType === 'All Assets') {
      initializeAllAssetsPaths();
    }
  };

  const handleAssetClick = (id) => {
    if (selectedAssetId === id) {
      setSelectedAssetId(null);
      setMidPanelAsset(null);
      setShowMidPanel(false);
      setTrailPath([]);
      setCurrentIndex(0);
      setTrailTime(0);
      setIsPlaying(false);
    } else {
      setSelectedAssetId(id);
      setMidPanelAsset(null);
      setShowMidPanel(false);
      setTrailPath(generateRandomPath());
      setCurrentIndex(0);
      setTrailTime(0);
      setIsPlaying(false);
    }
  };

  const handleDetailsClick = (assetId) => {
    if (assetType === 'All Assets') {
      setMidPanelAsset(assetMap['All Assets']);
    } else {
      setMidPanelAsset(assetId);
    }
    setShowMidPanel(true);
  };

  const assetDetails = (id) => ({
    id: id || '-',
    name: assetType,
    distance: id ? `${currentIndex * 15} m` : '0 m',
    speed: id ? `${(speed * 1.5).toFixed(1)} m/s` : '0 m/s',
    zone: id ? 'Storage Area' : '-',
    timeTaken: id ? `${(currentIndex / speed).toFixed(1)} s` : '0 s',
    idleTime: id ? `${(10 - currentIndex).toFixed(1)} s` : '0 s',
  });

  const getAssetItemStyle = (id) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    color: selectedAssetId === id ? (darkMode ? '#ffffff' : '#003366') : (darkMode ? '#b0b0b0' : '#000'),
    backgroundColor: selectedAssetId === id ? (darkMode ? '#404040' : '#cce0ff') : 'transparent',
    padding: '6px 10px',
    borderRadius: 12,
    boxShadow: selectedAssetId === id ? theme.shadow : 'none',
    transition: 'all 0.3s ease',
    userSelect: 'none',
    fontFamily: 'Segoe UI, sans-serif',
  });

  const detailsBtnStyle = {
    color: 'green',
    cursor: 'pointer',
    fontSize: 13,
    textDecoration: 'underline',
    fontWeight: 600,
    userSelect: 'none',
    transition: 'color 0.3s ease',
  };

  

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'times new roman',
      backgroundColor: theme.background,
      color: theme.textPrimary,
      position: isFullScreen ? 'fixed' : 'relative',
      top: isFullScreen ? 0 : 'auto',
      left: isFullScreen ? 0 : 'auto',
      zIndex: isFullScreen ? 9999 : 'auto',
    }}>
      {/* ... keep existing code (header section) */}
      <div style={{
        textAlign: 'left',
        padding: '4px 20px',
        marginBottom: 1,
        backgroundColor: theme.cardBackground,
        boxShadow: theme.shadow,
        display: isFullScreen ? 'none' : 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: theme.textPrimary, margin: 0 }}>Phantom Trail</h1>
          <p style={{ fontSize: '1rem', color: theme.textSecondary, margin: 0 }}>Warehouse</p>
        </div>
           
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          fontSize: '13px',
          fontWeight: '700'
        }}>
          {/* Live Trail Link */}
          <Link
          to="/"
          style={{
            textDecoration: 'none',
            color: '#ffffff' ,
            backgroundColor:  '#157AF6' ,
            padding: '6px 10px',
            border: `1px solid ${location.pathname === '/' ? '#003366' : (darkMode ? '#555' : '#ccc')}`,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <FaMapMarkerAlt size={14} />
          Live Trail
        </Link>

          {/* Heatmap Link */}
          <Link
            to="/heatmap"
            style={{
              textDecoration: 'none',
              color: location.pathname === '/heatmap' ? '#fff' : (darkMode ? '#ffffff' : '#000000'),
              backgroundColor: location.pathname === '/heatmap' ? '#F28D3C' : 'transparent',
              padding: '6px 10px',
              border: `1px solid ${location.pathname === '/heatmap' ? '#F28D3C' : (darkMode ? '#555' : '#ccc')}`,
              borderRadius: '9px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <FaFire size={14} />
            Heatmap
          </Link>

          {/* Dark Mode Toggle */}
          <span
            onClick={() => setDarkMode(!darkMode)}
            style={{
              marginLeft: '5px',
              cursor: 'pointer',
              fontSize: '10px',
              color: darkMode ? '#ffffff' : '#000000',
              transition: 'color 0.3s ease-in-out'
            }}
          >
            {darkMode ? <FaSun size={19} /> : <FaMoon size={19} />}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Panel */}
        <div style={{
          flexBasis: isFullScreen ? '100%' : '75%',
          padding: 16,
          backgroundColor: theme.cardBackground,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative'
        }}>
          <div
            id="warehouse-map-container"
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: theme.mapBackground,
              backgroundImage: `linear-gradient(${theme.gridColor} 1px, transparent 1px), linear-gradient(90deg, ${theme.gridColor} 1px, transparent 1px)`,
              backgroundSize: '20px 20px',
              border: `2px solid ${theme.border}`,
              borderRadius: 10,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: darkMode
                ? 'inset 0 0 8px rgba(0,0,0,0.2)'
                : 'inset 0 0 8px rgba(0,0,0,0.05)',
            }}
          >
            {/* Zoom & Fullscreen Buttons */}
            <div style={{
              position: 'absolute',
              top: 20,
              right: 20,
              zIndex: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              alignItems: 'center',
              backgroundColor: 'transparent',
              padding: '8px 12px',
              borderRadius: 8,
              boxShadow: 'none'
            }}>
              <FaSearchPlus
                style={{
                  cursor: 'pointer',
                  color: '#4C4C4C',
                  opacity: 0.9,
                  transition: 'opacity 0.2s ease',
                }}
                onClick={handleZoomIn}
                title="Zoom In"
                size={18}
                onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                onMouseOut={(e) => e.currentTarget.style.opacity = 0.9}
              />
              <FaSearchMinus
                style={{
                  cursor: 'pointer',
                  color: '#4C4C4C',
                  opacity: 0.9,
                  transition: 'opacity 0.2s ease',
                }}
                onClick={handleZoomOut}
                title="Zoom Out"
                size={18}
                onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                onMouseOut={(e) => e.currentTarget.style.opacity = 0.9}
              />
              {isFullScreen ? (
                <FaCompress
                  style={{
                    cursor: 'pointer',
                    color: '#4C4C4C',
                    opacity: 0.9,
                    transition: 'opacity 0.2s ease',
                  }}
                  onClick={handleFullScreenToggle}
                  title="Exit Full Screen"
                  size={18}
                  onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                  onMouseOut={(e) => e.currentTarget.style.opacity = 0.9}
                />
              ) : (
                <FaExpand
                  style={{
                    cursor: 'pointer',
                    color: '#4C4C4C',
                    opacity: 0.9,
                    transition: 'opacity 0.2s ease',
                  }}
                  onClick={handleFullScreenToggle}
                  title="Full Screen"
                  size={18}
                  onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                  onMouseOut={(e) => e.currentTarget.style.opacity = 0.9}
                />
              )}
            </div>

            {/* Scaled Map Content */}
            <div style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              transition: 'transform 0.3s ease-in-out',
              width: '100%',
              height: '100%',
              position: 'relative'
            }}>
              <svg width="100%" height="100%">
                {/* ... keep existing code (ROOM ZONES section) */}
                <rect x="20" y="20" width="150" height="150" fill={darkMode ? "#1a2332" : "#e6f2ff"} stroke={darkMode ? "#3d5a80" : "#005cbf"} strokeDasharray="6" strokeWidth="1.5" />
                <text x="90" y="95" fill={darkMode ? "#ffffff" : "#003366"} fontSize="12" textAnchor="middle">Asset Area</text>

                <rect x="200" y="20" width="200" height="200" fill={darkMode ? "#1a2e1a" : "#e8f5e9"} stroke={darkMode ? "#4caf50" : "#2e7d32"} strokeDasharray="6" strokeWidth="1.5" />
                <text x="295" y="120" fill={darkMode ? "#ffffff" : "#1b5e20"} fontSize="12" textAnchor="middle">Storage Area 1</text>

                <rect x="500" y="60" width="200" height="200" fill={darkMode ? "#1a2e1a" : "#e8f5e9"} stroke={darkMode ? "#4caf50" : "#2e7d32"} strokeDasharray="6" strokeWidth="1.5" />
                <text x="595" y="165" fill={darkMode ? "#ffffff" : "#1b5e20"} fontSize="12" textAnchor="middle">Storage Area 2</text>

                <rect x="650" y="280" width="120" height="120" fill={darkMode ? "#2e2a1a" : "#fff8e1"} stroke={darkMode ? "#ffb74d" : "#f9a825"} strokeDasharray="6" strokeWidth="1.5" />
                <text x="710" y="345" fill={darkMode ? "#ffffff" : "#ef6c00"} fontSize="12" textAnchor="middle">Service Area</text>

                <rect x="140" y="330" width="220" height="120" fill={darkMode ? "#2e1a2e" : "#f3e5f5"} stroke={darkMode ? "#ba68c8" : "#8e24aa"} strokeDasharray="6" strokeWidth="1.5" />
                <text x="240" y="400" fill={darkMode ? "#ffffff" : "#6a1b9a"} fontSize="12" textAnchor="middle">Receiving Dock</text>

                <rect x="380" y="330" width="220" height="120" fill={darkMode ? "#2e1a2e" : "#f3e5f5"} stroke={darkMode ? "#ba68c8" : "#8e24aa"} strokeDasharray="6" strokeWidth="1.5" />
                <text x="480" y="400" fill={darkMode ? "#ffffff" : "#6a1b9a"} fontSize="12" textAnchor="middle">Shipping Dock</text>

                <rect x="20" y="200" width="90" height="100" fill={darkMode ? "#2e1a26" : "#fce4ec"} stroke={darkMode ? "#ec407a" : "#ad1457"} strokeDasharray="6" strokeWidth="1.5" />
                <text x="60" y="260" fill={darkMode ? "#ffffff" : "#880e4f"} fontSize="12" textAnchor="middle">Office</text>

                <rect x="20" y="330" width="90" height="140" fill={darkMode ? "#1a2e2e" : "#e0f7fa"} stroke={darkMode ? "#26c6da" : "#00838f"} strokeDasharray="6" strokeWidth="1.5" />
                <text x="60" y="410" fill={darkMode ? "#ffffff" : "#006064"} fontSize="12" textAnchor="middle">Canteen</text>

                {/* ... keep existing code (ASSET TRAILS section) */}
                {assetType === 'All Assets'
                  ? Object.entries(allAssetsPaths).map(([id, path]) =>
                      path.slice(0, currentIndex + 1).map((p, i) =>
                        i > 0 ? (
                          <line
                            key={`${id}-line-${i}`}
                            x1={path[i - 1].x}
                            y1={path[i - 1].y}
                            x2={p.x}
                            y2={p.y}
                            stroke={getTrailColor(id)}
                            strokeWidth={2}
                          />
                        ) : null
                      )
                    )
                  : trailPath.slice(0, currentIndex + 1).map((p, i) =>
                      i > 0 ? (
                        <line
                          key={`single-line-${i}`}
                          x1={trailPath[i - 1].x}
                          y1={trailPath[i - 1].y}
                          x2={p.x}
                          y2={p.y}
                          stroke={getTrailColor()}
                          strokeWidth={2}
                        />
                      ) : null
                    )}

                {/* CHECKED ASSETS TRAILS */}
                {Object.entries(checkedAssetsPaths).map(([id, path]) =>
                  path.slice(0, currentIndex + 1).map((p, i) =>
                    i > 0 ? (
                      <line
                        key={`checked-${id}-line-${i}`}
                        x1={path[i - 1].x}
                        y1={path[i - 1].y}
                        x2={p.x}
                        y2={p.y}
                        stroke={getTrailColor(id)}
                        strokeWidth={2}
                      />
                    ) : null
                  )
                )}

                {/* ANIMATED CIRCLES WITH TOOLTIP */}
                {assetType === 'All Assets'
                  ? Object.entries(allAssetsPaths).map(([id, path]) =>
                      path.slice(0, currentIndex + 1).map((p, i) => (
                        <g key={`${id}-circle-${i}`}>
                          <circle cx={p.x} cy={p.y} r={6} fill={getTrailColor(id)}>
                            <title>{id}</title>
                          </circle>
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={10}
                            stroke={getTrailColor(id)}
                            strokeWidth="2"
                            fill="none"
                            opacity="0.4"
                          >
                            <animate attributeName="r" from="6" to="15" dur="1s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.6;0" dur="1s" repeatCount="indefinite" />
                            <title>{id}</title>
                          </circle>
                          {p.popup && (
                            <text x={p.x + 15} y={p.y - 10} fontSize="12" fill={darkMode ? '#ffffff' : '#4C4C4C'} fontWeight="bold">
                              END
                            </text>
                          )}
                        </g>
                      ))
                    )
                  : trailPath.slice(0, currentIndex + 1).map((p, i) => (
                      <g key={`single-circle-${i}`}>
                        <circle cx={p.x} cy={p.y} r={6} fill={getTrailColor()}>
                          <title>{selectedAssetId || assetType}</title>
                        </circle>
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={10}
                          stroke={getTrailColor()}
                          strokeWidth="2"
                          fill="none"
                          opacity="0.4"
                        >
                          <animate attributeName="r" from="6" to="15" dur="1s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.6;0" dur="1s" repeatCount="indefinite" />
                          <title>{selectedAssetId || assetType}</title>
                        </circle>
                        {p.popup && (
                          <text x={p.x + 15} y={p.y - 10} fontSize="12" fill={darkMode ? '#ffffff' : '#4C4C4C'} fontWeight="bold">
                            END
                          </text>
                        )}
                      </g>
                    ))}

                {/* CHECKED ASSETS CIRCLES WITH TOOLTIP */}
                {Object.entries(checkedAssetsPaths).map(([id, path]) =>
                  path.slice(0, currentIndex + 1).map((p, i) => (
                    <g key={`checked-${id}-circle-${i}`}>
                      <circle cx={p.x} cy={p.y} r={6} fill={getTrailColor(id)}>
                        <title>{id}</title>
                      </circle>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={10}
                        stroke={getTrailColor(id)}
                        strokeWidth="2"
                        fill="none"
                        opacity="0.4"
                      >
                        <animate attributeName="r" from="6" to="15" dur="1s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.6;0" dur="1s" repeatCount="indefinite" />
                        <title>{id}</title>
                      </circle>
                      {p.popup && (
                        <text x={p.x + 15} y={p.y - 10} fontSize="12" fill={darkMode ? '#ffffff' : '#4C4C4C'} fontWeight="bold">
                          END
                        </text>
                      )}
                    </g>
                  ))
                )}
              </svg>
            </div>

            {/* ... keep existing code (LEGEND section) */}
            <div style={{
              position: 'absolute',
              bottom: 20,
              left: 20,
              fontSize: 12,
              color: theme.textPrimary,
              display: 'flex',
              flexWrap: 'wrap',
              gap: '20px',
              alignItems: 'center',
              backgroundColor: darkMode ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)',
              padding: '10px 15px',
              borderRadius: 8,
              backdropFilter: 'blur(5px)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: 'purple', fontSize: 10, marginRight: 6 }}>⬤</span> Forklifts
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#EF6537', fontSize: 10, marginRight: 6 }}>⬤</span> Cranes
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#ED67B3', fontSize: 10, marginRight: 6 }}>⬤</span> Carts
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#F1C545', fontSize: 10, marginRight: 6 }}>⬤</span> Operators/Workers
              </div>
            </div>
          </div>
        </div>

        {/* ... keep existing code (Mid Panel and Right Panel sections) */}
{/* Mid Panel */}
{showMidPanel && !isFullScreen && (
  <div style={{
    flexBasis: '18%',
    backgroundColor: theme.cardBackground,
    borderRight: `1px solid ${theme.border}`,
    padding: 16,
    boxShadow: darkMode ? 'inset -2px 0 8px rgba(0,0,0,0.3)' : 'inset -2px 0 8px rgba(0,0,0,0.1)',
    overflowY: 'auto',
    position: 'relative'
  }}>
    <button
      onClick={() => setShowMidPanel(false)}
      style={{
        position: 'absolute',
        top: 12,
        right: 12,
        background: 'transparent',
        border: 'none',
        fontSize: 18,
        cursor: 'pointer',
        color: theme.textSecondary,
      }}
      onMouseEnter={e => (e.currentTarget.style.color = darkMode ? '#4a9eff' : '#007bff')}
      onMouseLeave={e => (e.currentTarget.style.color = theme.textSecondary)}
    >
      <FaTimes />
    </button>
    <h3 style={{ 
      fontSize: '1.1rem', 
      color: darkMode ? '#4a9eff' : '#007bff', 
      marginTop: 40, 
      marginBottom: 0, 
      fontWeight: '700', 
      alignItems: 'center', 
      marginLeft: 50
    }}>
      Asset Details
    </h3>
    <h6 style={{ 
      fontSize: '15px', 
      color: darkMode ? '#4a9eff' : '#007bff', 
      marginTop: 0, 
      marginBottom: 5, 
      fontWeight: '700', 
      marginLeft: 30
    }}>
      Performance metrics
    </h6>

    {(Array.isArray(midPanelAsset) ? midPanelAsset : [midPanelAsset]).map((assetId, index) => {
      const details = assetDetails(assetId);
      return (
        <div key={index} style={{ marginBottom: 20 }}>
          <div style={{ 
            fontWeight: 600, 
            fontSize: 14, 
            marginBottom: 6, 
            color: theme.textPrimary 
          }}>
            {assetId}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>

            {/* Distance */}
            <div
              style={{
                flex: '1 1 45%',
                backgroundColor: darkMode ? '#2d4a66' : '#e3f2fd',
                color: darkMode ? '#87ceeb' : '#1976d2',
                borderRadius: 12,
                padding: '12px 14px',
                fontWeight: 600,
                fontSize: 13,
                textAlign: 'center',
                transition: 'transform 0.2s ease, box-shadow 0.3s ease',
                boxShadow: darkMode ? '0 2px 5px rgba(0,0,0,0.3)' : '0 2px 5px rgba(0,0,0,0.1)',
                border: darkMode ? 'none' : '1px solid #bbdefb',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = darkMode ? '0 6px 15px rgba(0,0,0,0.4)' : '0 6px 15px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = darkMode ? '0 2px 5px rgba(0,0,0,0.3)' : '0 2px 5px rgba(0,0,0,0.1)';
              }}
            >
              Distance<br /><span style={{ fontSize: 16, fontWeight: '700' }}>{details.distance}</span>
            </div>

            {/* Speed */}
            <div
              style={{
                flex: '1 1 45%',
                backgroundColor: darkMode ? '#4a4a2d' : '#fff8e1',
                color: darkMode ? '#f0e68c' : '#f57f17',
                borderRadius: 12,
                padding: '12px 14px',
                fontWeight: 600,
                fontSize: 13,
                textAlign: 'center',
                transition: 'transform 0.2s ease, box-shadow 0.3s ease',
                boxShadow: darkMode ? '0 2px 5px rgba(0,0,0,0.3)' : '0 2px 5px rgba(0,0,0,0.1)',
                border: darkMode ? 'none' : '1px solid #fff176',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = darkMode ? '0 6px 15px rgba(0,0,0,0.4)' : '0 6px 15px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = darkMode ? '0 2px 5px rgba(0,0,0,0.3)' : '0 2px 5px rgba(0,0,0,0.1)';
              }}
            >
              Speed<br /><span style={{ fontSize: 16, fontWeight: '700' }}>{details.speed}</span>
            </div>

            {/* Idle Time */}
            <div
              style={{
                flex: '1 1 45%',
                backgroundColor: darkMode ? '#4a2d2d' : '#ffebee',
                color: darkMode ? '#ffa0a0' : '#c62828',
                borderRadius: 12,
                padding: '12px 14px',
                fontWeight: 600,
                fontSize: 13,
                textAlign: 'center',
                transition: 'transform 0.2s ease, box-shadow 0.3s ease',
                boxShadow: darkMode ? '0 2px 5px rgba(0,0,0,0.3)' : '0 2px 5px rgba(0,0,0,0.1)',
                border: darkMode ? 'none' : '1px solid #ffcdd2',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = darkMode ? '0 6px 15px rgba(0,0,0,0.4)' : '0 6px 15px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = darkMode ? '0 2px 5px rgba(0,0,0,0.3)' : '0 2px 5px rgba(0,0,0,0.1)';
              }}
            >
              Idle Time<br /><span style={{ fontSize: 16, fontWeight: '700' }}>{details.idleTime}</span>
            </div>

            {/* Time Taken */}
            <div
              style={{
                flex: '1 1 45%',
                backgroundColor: darkMode ? '#2d4a2d' : '#e8f5e9',
                color: darkMode ? '#90ee90' : '#2e7d32',
                borderRadius: 12,
                padding: '12px 14px',
                fontWeight: 600,
                fontSize: 13,
                textAlign: 'center',
                transition: 'transform 0.2s ease, box-shadow 0.3s ease',
                boxShadow: darkMode ? '0 2px 5px rgba(0,0,0,0.3)' : '0 2px 5px rgba(0,0,0,0.1)',
                border: darkMode ? 'none' : '1px solid #c8e6c9',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = darkMode ? '0 6px 15px rgba(0,0,0,0.4)' : '0 6px 15px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = darkMode ? '0 2px 5px rgba(0,0,0,0.3)' : '0 2px 5px rgba(0,0,0,0.1)';
              }}
            >
              Time Taken<br /><span style={{ fontSize: 16, fontWeight: '700' }}>{details.timeTaken}</span>
            </div>

            {/* Zone */}
            <div
              style={{
                flex: '1 1 100%',
                backgroundColor: darkMode ? '#2d4a4a' : '#e0f2f1',
                color: darkMode ? '#87ceeb' : '#00695c',
                borderRadius: 12,
                padding: '12px 14px',
                fontWeight: 600,
                fontSize: 13,
                textAlign: 'center',
                transition: 'transform 0.2s ease, box-shadow 0.3s ease',
                boxShadow: darkMode ? '0 2px 5px rgba(0,0,0,0.3)' : '0 2px 5px rgba(0,0,0,0.1)',
                border: darkMode ? 'none' : '1px solid #b2dfdb',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = darkMode ? '0 6px 15px rgba(0,0,0,0.4)' : '0 6px 15px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = darkMode ? '0 2px 5px rgba(0,0,0,0.3)' : '0 2px 5px rgba(0,0,0,0.1)';
              }}
            >
              Zone<br /><span style={{ fontSize: 16, fontWeight: '700' }}>{details.zone}</span>
            </div>

          </div>
        </div>
      );
    })}
  </div>
)}

        {/* Right Panel */}
        {!isFullScreen && (
        <div style={{
          flexBasis: showMidPanel ? '20%' : '25%',
          padding: 16,
          backgroundColor: theme.cardBackground,
          boxShadow: darkMode ? 'inset 2px 0 4px rgba(0,0,0,0.3)' : 'inset 2px 0 4px rgba(0,0,0,0.1)',
          overflowY: 'auto'
        }}>

          {/* Asset Type + ID + Details */}
          <div style={{
            border: `1px solid ${theme.border}`,
            borderRadius: 20,
            padding: 12,
            background: darkMode ? '#2a2a2a' : '#f8f9fa',
            boxShadow: theme.shadow
          }}>
            <label style={{ fontWeight: 600, display: 'flex', alignItems: 'center', marginBottom: 8, color: theme.textPrimary }}>
              <FaTruck style={{ marginRight: 6 }} /> Asset Type
            </label>
            <select
              value={assetType}
              onChange={(e) => handleAssetTypeChange(e.target.value)}
              style={{
                width: '100%',
                padding: 8,
                borderRadius: 20,
                border: `1px solid ${theme.border}`,
                backgroundColor: darkMode ? '#3a3a3a' : '#ffffff',
                color: theme.textPrimary,
                marginBottom: 0
              }}>
              <option>Forklifts</option>
              <option>Cranes</option>
              <option>Carts</option>
              <option>Operators/Workers</option>
              <option>All Assets</option>
            </select>

            <ul style={{ listStyle: 'none', padding: 0 }}>
              {assetMap[assetType].map((id) => {
                let icon = null;

                if (id.toLowerCase().includes('forklift')) {
                  icon = <FaTruck style={{ marginRight: 8 }} />;
                } else if (id.toLowerCase().includes('crane')) {
                  icon = <FaCog style={{ marginRight: 8 }} />;
                } else if (id.toLowerCase().includes('cart')) {
                  icon = <FaShoppingCart style={{ marginRight: 8 }} />;
                } else if (
                  id.toLowerCase().includes('worker') ||
                  id.toLowerCase().includes('operator')
                ) {
                  icon = <FaUserCog style={{ marginRight: 8 }} />;
                }

                return (
                  <li
                    key={id}
                    style={{
                      ...getAssetItemStyle(id),
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: darkMode ? '#3a3a3a' : '#f1f3f4',
                      color: theme.textPrimary,
                      borderColor: theme.border,
                    }}
                    onClick={() => assetType !== 'All Assets' && handleAssetClick(id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {icon}
                      <span>{id}</span>
                    </div>
                    <span
                      style={{
                        ...detailsBtnStyle,
                        color: darkMode ? '#4a9eff' : '#007bff',
                        backgroundColor: 'transparent'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDetailsClick(id);
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = darkMode ? '#87ceeb' : '#0056b3')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = darkMode ? '#4a9eff' : '#007bff')}
                    >
                      Details
                    </span>
                  </li>
                );
              })}
            </ul>

            {/* Time Range Selector with Calendar */}
            <div style={{
              border: `1px solid ${theme.border}`,
              borderRadius: 20,
              padding: 10,
              marginBottom: 12,
              background: darkMode ? '#2a2a2a' : '#f8f9fa',
              boxShadow: theme.shadow,
              boxSizing: 'border-box'
            }}>
              <label style={{
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                marginBottom: 8,
                fontSize: 14,
                color: theme.textPrimary
              }}>
                <FaClock style={{ marginRight: 6, fontSize: 16, color: darkMode ? '#4a9eff' : '#007bff' }} />
                Time Range
              </label>

              <div style={{ marginBottom: 10 }}>
                <label style={{
                  fontSize: 13,
                  fontWeight: 500,
                  marginBottom: 4,
                  display: 'block',
                  color: theme.textSecondary
                }}>
                  Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 12,
                    border: `1px solid ${theme.border}`,
                    backgroundColor: darkMode ? '#3a3a3a' : '#ffffff',
                    color: theme.textPrimary,
                    fontSize: 13,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{
                  fontSize: 13,
                  fontWeight: 500,
                  marginBottom: 4,
                  display: 'block',
                  color: theme.textSecondary
                }}>
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 12,
                    border: `1px solid ${theme.border}`,
                    backgroundColor: darkMode ? '#3a3a3a' : '#ffffff',
                    color: theme.textPrimary,
                    fontSize: 13,
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Playback Box */}
            <div style={{
              border: `1px solid ${theme.border}`,
              borderRadius: 20,
              padding: 12,
              marginBottom: 12,
              background: darkMode ? '#2a2a2a' : '#f8f9fa',
              boxShadow: theme.shadow,
              textAlign: 'left'
            }}>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: 8, color: theme.textPrimary }}>Playback Controls</label>
              
              <div style={{ display: 'flex', gap: 10, marginBottom: 6 }}>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: 11, marginBottom: 4, color: theme.textSecondary }}>Play</div>
                  <button onClick={() => setIsPlaying(true)} style={{
                    width: '100%',
                    padding: 6,
                    backgroundColor: darkMode ? '#4a7c59' : '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: 10,
                    boxShadow: theme.shadow,
                    fontSize: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FaPlay />
                  </button>
                </div>

                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: 11, marginBottom: 4, color: theme.textSecondary }}>Pause</div>
                  <button onClick={() => setIsPlaying(false)} style={{
                    width: '100%',
                    padding: 6,
                    backgroundColor: darkMode ? '#cc8400' : '#ffc107',
                    color: 'white',
                    border: 'none',
                    borderRadius: 10,
                    boxShadow: theme.shadow,
                    fontSize: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FaPause />
                  </button>
                </div>

                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: 11, marginBottom: 4, color: theme.textSecondary }}>Reset</div>
                  <button onClick={resetTrail} style={{
                    width: '100%',
                    padding: 6,
                    backgroundColor: darkMode ? '#b8312f' : '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: 10,
                    boxShadow: theme.shadow,
                    fontSize: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FaRedo />
                  </button>
                </div>
              </div>

              {/* Speed Selector */}
              <div style={{ margin: '8px 0' }}>
                <label style={{ fontWeight: 600, display: 'flex', alignItems: 'center', marginBottom: 4, color: theme.textPrimary }}>
                  <RiSpeedUpFill style={{ marginRight: 5, marginLeft: 4 }} /> Speed
                </label>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  {[0.5, 1, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSpeed(s)}
                      style={{
                        flex: 1,
                        backgroundColor: speed === s ? (darkMode ? '#4a9eff' : '#007bff') : (darkMode ? '#3a3a3a' : '#e9ecef'),
                        color: speed === s ? '#fff' : theme.textPrimary,
                        border: `1px solid ${speed === s ? (darkMode ? '#4a9eff' : '#007bff') : theme.border}`,
                        borderRadius: 10,
                        padding: '4px 0',
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Trail Time */}
              <div style={{ fontWeight: 600, marginTop: 8, color: theme.textPrimary }}>Trail Time: {trailTime}s</div>
              <input
                type="range"
                min={0}
                max={assetType === 'All Assets'
                  ? Math.min(...Object.values(allAssetsPaths).map(p => p.length)) - 1
                  : trailPath.length - 1}
                value={currentIndex}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setCurrentIndex(value);
                  setTrailTime(value);
                }}
                style={{ 
                  width: '100%', 
                  marginTop: 6,
                  accentColor: darkMode ? '#4a9eff' : '#007bff'
                }}
              />
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default LiveTrailDashboard;