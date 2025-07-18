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
  
} from 'react-icons/fa';
import { IoSunny } from "react-icons/io5";
import { HiMoon } from "react-icons/hi2";
import { GiTrail } from "react-icons/gi";

import { RiSpeedUpFill } from "react-icons/ri";
import { Link, useLocation } from 'react-router-dom';

const LiveTrailDashboard = () => {
  const [view, setView] = useState('live');
  const location = useLocation();

  const [assetType, setAssetType] = useState('Forklifts');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [checkedAssets, setCheckedAssets] = useState<Set<string>>(new Set());
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [trailTime, setTrailTime] = useState<number>(0);
  const [timeRange, setTimeRange] = useState('1 Hour');
  const [scale, setScale] = useState(1); // Default zoom out a little
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showMidPanel, setShowMidPanel] = useState(false);
  const [midPanelAsset, setMidPanelAsset] = useState<string | string[] | null>(null);
  const intervalRef = useRef(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [allAssetsPaths, setAllAssetsPaths] = useState<Record<string, { x: number; y: number; popup?: boolean; zoneName?: string }[]>>({});
  const [checkedAssetsPaths, setCheckedAssetsPaths] = useState<Record<string, { x: number; y: number; popup?: boolean; zoneName?: string }[]>>({});
  const [trailPath, setTrailPath] = useState<{ x: number; y: number; popup?: boolean; zoneName?: string }[]>([]);
  const [heatmapOption, setHeatmapOption] = useState('');
const [isHeatmapHovered, setIsHeatmapHovered] = useState(false);
const [darkMode, setDarkMode] = useState(() => {
  const saved = localStorage.getItem('darkMode');
  return saved === 'true'; // fallback is light mode
});

useEffect(() => {
  localStorage.setItem('darkMode', String(darkMode));
}, [darkMode]);







  const theme = {
    background: darkMode ? '#1A1A1A' : '#f9f9f9',
    cardBackground: darkMode ? '#1A1A1A' : '#ffffff',
    textPrimary: darkMode ? '#ffffff' : '#003366',
    textSecondary: darkMode ? '#b0b0b0' : '#5c7ea3',
    border: darkMode ? '#404040' : '#ccc',
    shadow: darkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.05)',
    mapBackground: darkMode ? '#1a1a1a' : '#ffffff',
    gridColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
    fontFamily: 'Libertinus Math'
  };

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));
  const handleFullScreenToggle = () => setIsFullScreen(prev => !prev);
  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const handleStartPlayback = () => {
    if (checkedAssets.size === 0) {
      alert("Please select at least one asset to play the trail.");
      return;
    }
  
    // Only generate paths if it's the first time or after reset
    const newCheckedAssetsPaths: Record<string, { x: number; y: number; popup?: boolean; zoneName?: string }[]> = { ...checkedAssetsPaths };
  
    checkedAssets.forEach(assetId => {
      if (!newCheckedAssetsPaths[assetId]) {
        newCheckedAssetsPaths[assetId] = generateRandomPath(assetId);
      }
    });
  
    setCheckedAssetsPaths(newCheckedAssetsPaths);
    setIsPlaying(true);
  };
  

  const handleStopPlayback = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
  };
  
  
  const assetMap: Record<string, string[]> = {
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

  function getNearestZoneEndpoint(currentX: number, currentY: number) {
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

  function generateRandomPath(
  assetId: string,
  occupiedCoords: Set<string> = new Set<string>()
): { x: number; y: number; popup?: boolean; zoneName?: string }[] {
  const path: { x: number; y: number; popup?: boolean; zoneName?: string }[] = [];
  const stepSize = 30;

  let { x, y } = getRandomZoneStart();
  path.push({ x, y });
  occupiedCoords.add(`${x},${y}`);

  const isValid = (nx: number, ny: number) =>
    nx >= 10 &&
    nx <= 790 &&
    ny >= 10 &&
    ny <= 490 &&
    !occupiedCoords.has(`${nx},${ny}`);

  const visitedZones = new Set<number>();
  let currentZoneIndex = ZONES.findIndex(
    (zone) => Math.abs(zone.x - x) < 30 && Math.abs(zone.y - y) < 30
  );
  if (currentZoneIndex !== -1) visitedZones.add(currentZoneIndex);

  for (let i = 0; i < 30; i++) {
    let targetZone: { name: string; x: number; y: number } | null = null;
    const unvisitedZones = ZONES.filter((_, index) => !visitedZones.has(index));

    if (unvisitedZones.length > 0) {
      targetZone = unvisitedZones[Math.floor(Math.random() * unvisitedZones.length)];
      const zoneIndex = ZONES.indexOf(targetZone);
      visitedZones.add(zoneIndex);
    }

    let directions: { dx: number; dy: number }[];
    if (targetZone) {
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
        { dx: -stepSize, dy: -stepSize },
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
        { dx: -stepSize, dy: -stepSize },
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




  const handleCheckboxChange = (assetId: string, checked: boolean) => {
  const newCheckedAssets = new Set(checkedAssets);
  const updatedPaths = { ...checkedAssetsPaths };
  
  if (checked) {
    newCheckedAssets.add(assetId);
    
    // Only generate path if it doesn't already exist
    if (!updatedPaths[assetId]) {
      const fullPath = generateRandomPath(assetId);
      updatedPaths[assetId] = fullPath;
    }
    
  } else {
    newCheckedAssets.delete(assetId);
    // Keep the path in memory - don't delete it
  }
  
  setCheckedAssets(newCheckedAssets);
  setCheckedAssetsPaths(updatedPaths);
};
  const initializeAllAssetsPaths = () => {
    const paths: Record<string, { x: number; y: number; popup?: boolean; zoneName?: string }[]> = {};
    assetMap['All Assets'].forEach((id: string) => {
      paths[id] = generateRandomPath(id);
    });
    setAllAssetsPaths(paths);
  };



  
    const heatmapRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (heatmapRef.current && e.target instanceof Node && (heatmapRef.current as any).contains && !(heatmapRef.current as any).contains(e.target)) {
        setIsHeatmapHovered(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const getTrailColor = (type = assetType, darkMode = false) => {
    switch (type) {
    
      case 'Forklifts':
      case 'Forklift A':
      case 'Forklift B':
        return darkMode ? '#BF00FF' : '#BF00FF'; // Neon Purple : Dark Purple
  
    
      case 'Cranes':
      case 'Crane A':
      case 'Crane B':
        return darkMode ? '#FFA500' : '#CC5500'; // Neon Orange : Dark Orange
  
     
      case 'Carts':
      case 'Cart X':
      case 'Cart Y':
        return darkMode ? '#FF69B4' : '#D11A7C'; // Neon Pink : Dark Hot Pink
  
     
      case 'Operators/Workers':
      case 'Worker 1':
      case 'Worker 2':
        return darkMode ? '#FFEB3B' : '#F1C40F'; // Bright Yellow : Gold Yellow
  
     
      default:
        return darkMode ? '#66D9FF' : '#007BFF'; // Neon Blue : Base Blue
    }
  };
  
  
  useEffect(() => {
    setTrailPath(generateRandomPath(selectedAssetId || ''));
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
          let maxLength = 0;
          if (Array.from(checkedAssets).length > 0) {
            maxLength = Math.min(...Object.values(checkedAssetsPaths).map((p) => (p as any[]).length));
          } else if (assetType === 'All Assets') {
            maxLength = Math.min(...Object.values(allAssetsPaths).map((p) => (p as any[]).length));
          } else {
            maxLength = trailPath.length;
          }

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
  }, [isPlaying, speed, allAssetsPaths, trailPath, checkedAssetsPaths, checkedAssets]);

  const resetTrail = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  
    setIsPlaying(false);
    setTrailTime(0);
    setCurrentIndex(0);
    setTrailPath(generateRandomPath(''));
    setSelectedAssetId(null);
    setMidPanelAsset(null);
    setShowMidPanel(false);
    setCheckedAssets(new Set());
    setCheckedAssetsPaths({});
  
    if (assetType === 'All Assets') {
      initializeAllAssetsPaths();
    } else {
      setAllAssetsPaths({});
    }
  };
  
  const handleAssetTypeChange = (newType: string) => {
  setIsPlaying(false);
  setCurrentIndex(0);
  setTrailTime(0);
  setTrailPath(generateRandomPath(''));
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

  const handleAssetClick = (id: string): void => {
  if (selectedAssetId === id) {
    setSelectedAssetId(null);
    setMidPanelAsset(null);
    setShowMidPanel(false);
    setTrailPath(selectedAssetId ? generateRandomPath(selectedAssetId) : []);
    setCurrentIndex(0);
    setTrailTime(0);
    setIsPlaying(false);
  } else {
    setSelectedAssetId(id);
    setMidPanelAsset(null);
    setShowMidPanel(false);
    setTrailPath(generateRandomPath(''));
    setCurrentIndex(0);
    setTrailTime(0);
    setIsPlaying(false);
  }
};

  const handleDetailsClick = (assetId: string): void => {
  if (assetType === 'All Assets') {
    setMidPanelAsset(assetMap['All Assets']);
  } else {
    setMidPanelAsset(assetId);
  }
  setShowMidPanel(true);
};

  const assetDetails = (id: string | null) => ({
    id: id || '-',
    name: assetType,
    distance: id ? `${currentIndex * 15} m` : '0 m',
    speed: id ? `${(speed * 1.5).toFixed(1)} m/s` : '0 m/s',
    zone: id ? 'Storage Area' : '-',
    timeTaken: id ? `${(currentIndex / speed).toFixed(1)} s` : '0 s',
    idleTime: id ? `${(10 - currentIndex).toFixed(1)} s` : '0 s',
  });

  const handleReset = () => {
    setScale(1);           // Reset zoom level to default
    setHeatmapOption('');   // Optional: Reset heatmap filter if needed
  };
  
  

  const getAssetItemStyle = (id: string | null) => ({
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
    userSelect: 'none' as const,
    fontFamily: 'Libertinus Math'
  });

  const detailsBtnStyle = {
    color: 'green',
    cursor: 'pointer',
    fontSize: 13,
    textDecoration: 'underline',
    fontWeight: 600,
    userSelect: 'none' as const,
    transition: 'color 0.3s ease',
  };
  const gradientStyle = {
    background: darkMode
      ? 'linear-gradient(90deg, #C86CE3 0%, #41BFEF 100%)'  // Dark Mode
      : 'linear-gradient(90deg, #9B2FC2 0%, #3AB6E7 100%)',  // Light Mode
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  };
  
  const isSelected = location.pathname === '/';
  <style>
  {`
  @media (max-width: 768px) {
    .header {
      flex-direction: column !important;
      align-items: flex-start !important;
      padding: 8px 16px !important;
    }
  
    .nav-links {
      position: static !important;
      margin-top: 10px !important;
      gap: 12px !important;
      flex-wrap: wrap !important;
    }
  
    .map-container {
      flex-basis: 100% !important;
      padding: 8px !important;
      min-height: 300px !important;
    }
  
    .zoom-controls {
      bottom: 20px !important;
      right: 20px !important;
      flex-direction: column !important;
      gap: 10px !important;
    }
  
    .legend {
      left: 10px !important;
      bottom: 10px !important;
      gap: 10px !important;
      padding: 8px 10px !important;
      font-size: 11px !important;
      flex-direction: column !important;
    }
  
    .active-indicators {
      top: 10px !important;
      right: 10px !important;
      flex-direction: column !important;
      align-items: flex-start !important;
      font-size: 12px !important;
      gap: 8px !important;
    }
  }
  `}
  </style>
  
  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Libertinus Math',
      backgroundColor: theme.background,
      color: theme.textPrimary,
      position: isFullScreen ? 'fixed' : 'relative',
      top: isFullScreen ? 0 : 'auto',
      left: isFullScreen ? 0 : 'auto',
      zIndex: isFullScreen ? 9999 : 'auto'
    }}>

      {/* Header */}
      <div style={{
        textAlign: 'left',
        padding: '4px 20px',
        backgroundColor: theme.cardBackground,
        boxShadow: darkMode ? '0 2px 4px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.05)',
        display: isFullScreen ? 'none' : 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
      }} className="header">

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <GiTrail size={28} color={darkMode ? '#39FF14' : '#1F51FF'} />
          <div>
            <h1 style={{
              fontSize: '1.8rem',
              color: darkMode ? '#39FF14' : '#1F51FF',
              margin: 0,
              fontWeight: 600,
              fontFamily: 'Libertinus Math'
            }}>
              Phantom Trail
            </h1>
            <p style={{
              fontSize: '1rem',
              color: darkMode ? '#F28D3C' : '#39FF14',
              margin: 0,
              fontWeight: 700,
              fontFamily: 'Libertinus Math'
            }}>
              Warehouse
            </p>
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            top: 20,
            right: 100,
            zIndex: 1000,
            display: 'flex',
            gap: '20px',
            alignItems: 'center',
            fontWeight: 700,
            fontSize: 15
          }}
          className="nav-links"
        >

          {/* Action Trail */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              fontWeight: 700,
              gap: '5px',
              marginTop: 4,
              textDecoration: location.pathname === '/' ? 'underline' : 'none',
              color: '#4B9DF7',
              cursor: 'pointer',
              transition: 'color 0.3s ease',
            }}
          >
            <FaMapMarkerAlt size={14} />
            Action Trail
          </Link>

          {/* Heatmap with Dropdown */}
          <div
            ref={heatmapRef}
            onMouseEnter={() => setIsHeatmapHovered(true)}
            style={{ position: 'relative', cursor: 'pointer' }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                marginTop: 3,
                color: isHeatmapHovered || location.pathname === '/heatmap'
                  ? '#F28D3C'
                  : (darkMode ? '#ffffff' : '#000000'),
                textDecoration: location.pathname === '/heatmap' ? 'underline' : 'none',
                transition: 'color 0.3s ease',
              }}
            >
              <FaFire size={14} />
              Heatmap ▾
            </div>

            {isHeatmapHovered && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
                border: `1px solid ${darkMode ? '#555' : '#ddd'}`,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                borderRadius: 6,
                marginTop: 6,
                padding: '8px 0',
                minWidth: 180,
                display: 'flex',
                flexDirection: 'column',
                zIndex: 9999,
              }}>
                {['Dwell Time', 'Visit Frequency', 'Peak Occupancy', 'Power Consumption'].map(option => (
                  <Link
                    key={option}
                    to="/heatmap"
                    onClick={() => {
                      setHeatmapOption(option);
                      setIsHeatmapHovered(false);
                    }}
                    style={{
                      textDecoration: heatmapOption === option ? 'underline' : 'none',
                      padding: '8px 16px',
                      color: heatmapOption === option ? '#F28D3C' : (darkMode ? '#fff' : '#000'),
                      backgroundColor: heatmapOption === option ? '#F28D3C22' : 'transparent',
                      fontSize: '14px',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      display: 'block',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#F28D3C'}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = heatmapOption === option
                        ? '#F28D3C'
                        : (darkMode ? '#fff' : '#000');
                    }}
                  >
                    {option}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dark Mode Toggle */}
        <div
          onClick={() => setDarkMode(!darkMode)}
          style={{
            width: '52px',
            height: '28px',
            borderRadius: '999px',
            position: 'relative',
            cursor: 'pointer',
            overflow: 'hidden',
            background: darkMode
              ? 'linear-gradient(135deg, #3b0764, #1e40af)'
              : 'linear-gradient(135deg, #fde68a, #f59e0b)',
            transition: 'background 0.4s ease-in-out',
            boxShadow: 'inset 0 0 6px rgba(0,0,0,0.2)',
            marginLeft: '5px',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: darkMode ? '26px' : '4px',
              transform: 'translateY(-50%)',
              transition: 'left 0.4s ease-in-out',
              width: '23px',
              height: '23px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                backgroundColor: 'white',
                zIndex: 0,
                backdropFilter: 'blur(1px)',
              }}
            />
            <div style={{ position: 'relative', zIndex: 1 }}>
              {darkMode ? (
                <HiMoon
                  size={20}
                  style={{
                    color: '#32217E',
                    transform: 'scaleX(-1) translateY(3px)',
                    transition: 'opacity 0.3s ease-in-out',
                    padding: 20,
                  }}
                />
              ) : (
                <IoSunny
                  size={20}
                  style={{
                    color: '#F7B944',
                    transition: 'opacity 0.3s ease-in-out',
                    transform: 'scaleX(-1) translateY(3.5px)',
                    padding: 10,
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
        flexDirection: window.innerWidth <= 768 ? 'column' : 'row'
      }}>

        {/* Map Container */}
        <div style={{
          flexBasis: isFullScreen ? '100%' : window.innerWidth <= 768 ? '60%' : '75%',
          padding: window.innerWidth <= 768 ? 8 : 16,
          backgroundColor: theme.cardBackground,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          minHeight: window.innerWidth <= 768 ? '300px' : 'auto'
        }} className="map-container">

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

            {/* Active Indicators (Top Right of Grid) */}
            <div style={{
              position: 'absolute',
              top: 20,
              right: 30,
              zIndex: 20,
              display: 'flex',
              gap: '20px',
              alignItems: 'center',
              fontSize: 13,
              fontWeight: 500,
              color: darkMode ? '#ccc' : '#333',
            }} className="active-indicators">

              {/* Green blinking dot + Active Assets */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#00C853',
                  animation: 'blink 1s infinite',
                }} />
                <span>Active Assets: 2</span>
              </div>

              {/* Blue dot + Active Zones */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#1E88E5',
                  animation: 'blink 1s infinite',
                }} />
                <span>Active Zones: 8</span>
              </div>
            </div>

            <style>
              {`
                @keyframes blink {
                  0% { opacity: 1; }
                  50% { opacity: 0.3; }
                  100% { opacity: 1; }
                }
              `}
            </style>

            <div style={{
              position: 'absolute',
              bottom: 30,
              right: 30,
              zIndex: 20,
              display: 'flex',
              gap: '14px',
              alignItems: 'center',
            }} className="zoom-controls">

              {/* Zoom In */}
              <FaSearchPlus
                style={{
                  cursor: 'pointer',
                  color: darkMode ? '#CCCCCC' : '#333333',
                  opacity: 0.9,
                  transition: 'opacity 0.2s ease',
                }}
                onClick={handleZoomIn}
                title="Zoom In"
                size={18}
                onMouseOver={e => e.currentTarget.style.opacity = '1'}
                onMouseOut={e => e.currentTarget.style.opacity = '0.9'}
              />

              {/* Zoom Out */}
              <FaSearchMinus
                style={{
                  cursor: 'pointer',
                  color: darkMode ? '#CCCCCC' : '#333333',
                  opacity: 0.9,
                  transition: 'opacity 0.2s ease',
                }}
                onClick={handleZoomOut}
                title="Zoom Out"
                size={18}
                onMouseOver={e => e.currentTarget.style.opacity = '1'}
                onMouseOut={e => e.currentTarget.style.opacity = '0.9'}
              />

              {/* Fullscreen Toggle */}
              {isFullScreen ? (
                <FaCompress
                  style={{
                    cursor: 'pointer',
                    color: darkMode ? '#CCCCCC' : '#333333',
                    opacity: 0.9,
                    transition: 'opacity 0.2s ease',
                  }}
                  onClick={handleFullScreenToggle}
                  title="Exit Full Screen"
                  size={18}
                  onMouseOver={e => e.currentTarget.style.opacity = '1'}
                  onMouseOut={e => e.currentTarget.style.opacity = '0.9'}
                />
              ) : (
                <FaExpand
                  style={{
                    cursor: 'pointer',
                    color: darkMode ? '#CCCCCC' : '#333333',
                    opacity: 0.9,
                    transition: 'opacity 0.2s ease',
                  }}
                  onClick={handleFullScreenToggle}
                  title="Full Screen"
                  size={18}
                  onMouseOver={e => e.currentTarget.style.opacity = '1'}
                  onMouseOut={e => e.currentTarget.style.opacity = '0.9'}
                />
              )}

              {/* Reset Button */}
              <button
                onClick={handleReset}
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  padding: '4px 8px',
                  borderRadius: 4,
                  backgroundColor: 'transparent',
                  border: `1px solid ${darkMode ? '#666' : '#ccc'}`,
                  color: darkMode ? '#CCCCCC' : '#333333',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.backgroundColor = darkMode ? '#333' : '#f0f0f0';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title="Reset Map to Default View"
              >
                Reset
              </button>
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
                {/* ROOM ZONES */}
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

                {/* ASSET TRAILS */}
{Array.from(checkedAssets).length > 0 ? (
  Object.entries(checkedAssetsPaths).map(([id, path]) => {
    const visiblePath = path.slice(0, currentIndex + 1); // Show trail up to currentIndex even during pause
    return visiblePath.map((p, i) =>
      i > 0 ? (
        <line
          key={`checked-${id}-line-${i}`}
          x1={visiblePath[i - 1].x}
          y1={visiblePath[i - 1].y}
          x2={p.x}
          y2={p.y}
          stroke={getTrailColor(id)}
          strokeWidth={2}
          opacity={1}
        />
      ) : null
    );
  })
) : assetType === 'All Assets' ? (
  Object.entries(allAssetsPaths).map(([id, path]) => {
    const visiblePath = path.slice(0, currentIndex + 1);
    return visiblePath.map((p, i) =>
      i > 0 ? (
        <line
          key={`${id}-line-${i}`}
          x1={visiblePath[i - 1].x}
          y1={visiblePath[i - 1].y}
          x2={p.x}
          y2={p.y}
          stroke={getTrailColor(id)}
          strokeWidth={2}
        />
      ) : null
    );
  })
) : (
  trailPath.slice(0, currentIndex + 1).map((p, i) =>
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
  )
)}

{/* CURRENT POSITION CIRCLE */}
{Array.from(checkedAssets).length > 0 ? (
  Object.entries(checkedAssetsPaths).map(([id, path]) => {
    const visiblePath = path.slice(0, currentIndex + 1);
    const current = visiblePath[visiblePath.length - 1];
    return (
      <g key={`current-${id}`}>
        <circle cx={current.x} cy={current.y} r={6} fill={getTrailColor(id)}>
          <title>{id}</title>
        </circle>
        <circle
          cx={current.x}
          cy={current.y}
          r={10}
          stroke={getTrailColor(id)}
          strokeWidth={2}
          fill="none"
          opacity="0.4"
        >
          <animate attributeName="r" from="6" to="15" dur="1s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0" dur="1s" repeatCount="indefinite" />
        </circle>
        {current.popup && (
          <text x={current.x + 15} y={current.y - 10} fontSize="12" fill={darkMode ? '#fff' : '#4C4C4C'} fontWeight="bold">
            END
          </text>
        )}
      </g>
    );
  })
) : currentIndex < trailPath.length && (
  <g>
    <circle cx={trailPath[currentIndex].x} cy={trailPath[currentIndex].y} r={6} fill={getTrailColor()} />
    <circle
      cx={trailPath[currentIndex].x}
      cy={trailPath[currentIndex].y}
      r={10}
      stroke={getTrailColor()}
      strokeWidth={2}
      fill="none"
      opacity="0.4"
    >
      <animate attributeName="r" from="6" to="15" dur="1s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.6;0" dur="1s" repeatCount="indefinite" />
    </circle>
    {trailPath[currentIndex].popup && (
      <text x={trailPath[currentIndex].x + 15} y={trailPath[currentIndex].y - 10} fontSize="12" fill={darkMode ? '#fff' : '#4C4C4C'} fontWeight="bold">
        END
      </text>
    )}
  </g>
)}

{/* STATIC DOTS */}
{Array.from(checkedAssets).length > 0 ? (
  Object.entries(checkedAssetsPaths).map(([id, path]) => {
    const visiblePath = path.slice(0, currentIndex + 1);
    return visiblePath.map((p, i) => (
      <circle
        key={`static-${id}-${i}`}
        cx={p.x}
        cy={p.y}
        r={4}
        fill={getTrailColor(id)}
        opacity={0.8}
      >
        <title>{id}</title>
      </circle>
    ));
  })
) : assetType === 'All Assets' ? (
  Object.entries(allAssetsPaths).map(([id, path]) => {
    const visiblePath = path.slice(0, currentIndex + 1);
    return visiblePath.map((p, i) => (
      <circle
        key={`static-${id}-${i}`}
        cx={p.x}
        cy={p.y}
        r={4}
        fill={getTrailColor(id)}
        opacity={0.8}
      >
        <title>{id}</title>
      </circle>
    ));
  })
) : (
  trailPath.slice(0, currentIndex + 1).map((p, i) => (
    <circle
      key={`static-single-${i}`}
      cx={p.x}
      cy={p.y}
      r={4}
      fill={getTrailColor()}
      opacity={0.8}
    >
      <title>{selectedAssetId || assetType}</title>
    </circle>
  ))
)}


               
              </svg>
            </div>

            {/* LEGEND */}
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
            }} className="legend">

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#BF00FF', fontSize: 10, marginRight: 6 }}>⬤</span> Forklifts
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#CC5500', fontSize: 10, marginRight: 6 }}>⬤</span> Cranes
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#D11A7C', fontSize: 10, marginRight: 6 }}>⬤</span> Carts
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#F1C40F', fontSize: 10, marginRight: 6 }}>⬤</span> Operators/Workers
              </div>
            </div>
          </div>
        </div>

        {/* Mid Panel */}
        {showMidPanel && !isFullScreen && (
          <div 
            className={darkMode ? 'mid-panel dark-scroll' : 'mid-panel light-scroll'}
            style={{
              flexBasis: window.innerWidth <= 768 ? '100%' : '18%',
              backgroundColor: theme.cardBackground,
              padding: 16,
              overflowY: 'auto',
              position: 'relative',
              maxHeight: window.innerWidth <= 768 ? '300px' : 'auto'
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
              marginLeft: window.innerWidth <= 768 ? 20 : 50
            }}>
              Asset Details
            </h3>
            <h6 style={{ 
              fontSize: '15px', 
              color: darkMode ? '#4a9eff' : '#007bff', 
              marginTop: 0, 
              marginBottom: 5, 
              fontWeight: '700', 
              marginLeft: window.innerWidth <= 768 ? 10 : 30
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

        {/* Right Panel - Controls */}
{!isFullScreen && (
  <div 
    className={darkMode ? 'mid-panel dark-scroll' : 'mid-panel light-scroll'}
    style={{
      flexBasis: showMidPanel ? (window.innerWidth <= 768 ? '100%' : '20%') : (window.innerWidth <= 768 ? '40%' : '25%'),
      padding: window.innerWidth <= 768 ? 8 : 16,
      backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
      boxShadow: theme.shadow,
      overflowY: 'auto',
    }}>

    {/* Asset Type Box */}
    <div style={{
      border: `1px solid ${darkMode ? '#555' : '#ccc'}`,
      borderRadius: 20,
      padding: 12,
      marginBottom: 10,
      backgroundColor: darkMode ? '#2a2a2a' : '#ffffff',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
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
          border: `0.5px solid ${theme.border}`,
          backgroundColor: darkMode ? '#3a3a3a' : '#ffffff',
          color: theme.textPrimary,
        }}>
        {Object.keys(assetMap).map(type => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>

      <ul style={{ listStyle: 'none', padding: 0, marginTop: 10 }}>
        {assetMap[assetType].map((id) => {
          const isChecked = checkedAssets.has(id);
          let icon = null;
          if (id.toLowerCase().includes('forklift')) icon = <FaTruck style={{ marginRight: 8 }} />;
          else if (id.toLowerCase().includes('crane')) icon = <FaCog style={{ marginRight: 8 }} />;
          else if (id.toLowerCase().includes('cart')) icon = <FaShoppingCart style={{ marginRight: 8 }} />;
          else if (id.toLowerCase().includes('worker') || id.toLowerCase().includes('operator'))
            icon = <FaUserCog style={{ marginRight: 8 }} />;

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
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => {
                    e.stopPropagation();
                    if (e.target.checked) {
                      setCheckedAssets((prev) => {
                        const updated = new Set(prev).add(id);
                        generateRandomPath(id);
                        return updated;
                      });
                    } else {
                      setCheckedAssets((prev) => {
                        const updated = new Set(prev);
                        updated.delete(id);
                        return updated;
                      });
                    }
                  }}
                  style={{ marginRight: 8 }}
                />
                {icon}
                <span>{id}</span>
              </div>

              <span
                style={{
                  ...detailsBtnStyle,
                  color: darkMode ? '#4a9eff' : '#007bff',
                  backgroundColor: 'transparent',
                  userSelect: 'none'
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
    </div>

    {/* Time Range Selector */}
    <div style={{
      border: `1px solid ${darkMode ? '#555' : '#ccc'}`,
      borderRadius: 20,
      padding: 19,
      marginBottom: 10,
      backgroundColor: darkMode ? '#2a2a2a' : '#ffffff',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    }}>
      <label style={{
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        marginBottom: 8,
        marginLeft: -6,
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
          marginLeft: -5,
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
            padding: '9px 5px',
            borderRadius: 10,
            marginLeft: -5,
            border: `1px solid ${theme.border}`,
            backgroundColor: darkMode ? '#3a3a3a' : '#ffffff',
            color: theme.textPrimary,
            fontSize: 12
          }}
        />
      </div>

      <div>
        <label style={{
          fontSize: 13,
          fontWeight: 500,
          marginBottom: 4,
          display: 'block',
          marginLeft: -5,
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
            padding: '9px 5px',
            borderRadius: 10,
            marginLeft: -5,
            marginRight: 10,
            border: `1px solid ${theme.border}`,
            backgroundColor: darkMode ? '#3a3a3a' : '#ffffff',
            color: theme.textPrimary,
            fontSize: 12
          }}
        />
      </div>
    </div>

   {/* Playback Controls */}
<div style={{
  border: `1px solid ${darkMode ? '#555' : '#ccc'}`,
  borderRadius: 20,
  padding: 12,
  backgroundColor: darkMode ? '#2a2a2a' : '#ffffff',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
}}>
  <label style={{
    fontWeight: 600,
    display: 'block',
    marginBottom: 8,
    color: theme.textPrimary
  }}>
    Playback Controls
  </label>

  <div style={{ display: 'flex', gap: 10 }}>
    {/* Play Button */}
    <div style={{ textAlign: 'center', flex: 1 }}>
      <div style={{ fontSize: 11, marginBottom: 4, color: theme.textSecondary }}>Play</div>
      <button
        onClick={handleStartPlayback}
        disabled={checkedAssets.size === 0}
        style={{
          width: '100%',
          backgroundColor: checkedAssets.size === 0 ? '#999' : (darkMode ? '#4CAF50' : '#28a745'),
          color: 'white',
          padding: 6,
          border: 'none',
          borderRadius: 10,
          fontSize: 16,
          fontWeight: 600,
          cursor: checkedAssets.size === 0 ? 'not-allowed' : 'pointer'
        }}>
        <FaPlay />
      </button>
    </div>

    {/* Pause Button */}
    <div style={{ textAlign: 'center', flex: 1 }}>
      <div style={{ fontSize: 11, marginBottom: 4, color: theme.textSecondary }}>Pause</div>
      <button
        onClick={handleStopPlayback}
        style={{
          width: '100%',
          backgroundColor: darkMode ? '#cc8400' : '#ffc107',
          color: 'white',
          padding: 6,
          border: 'none',
          borderRadius: 10,
          fontSize: 16
        }}>
        <FaPause />
      </button>
    </div>

    {/* Reset Button */}
    <div style={{ textAlign: 'center', flex: 1 }}>
      <div style={{ fontSize: 11, marginBottom: 4, color: theme.textSecondary }}>Reset</div>
      <button
        onClick={resetTrail}
        style={{
          width: '100%',
          backgroundColor: darkMode ? '#b8312f' : '#dc3545',
          color: 'white',
          padding: 6,
          border: 'none',
          borderRadius: 10,
          fontSize: 16
        }}>
        <FaRedo />
      </button>
    </div>
  </div>

      {/* Speed Selector */}
      <div style={{ margin: '8px 0' }}>
        <label style={{ fontWeight: 600, display: 'flex', alignItems: 'center', marginBottom: 4, color: theme.textPrimary }}>
          <RiSpeedUpFill style={{ marginRight: 5 }} /> Speed
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
              }}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      <div style={{ fontWeight: 600, marginTop: 8, color: theme.textPrimary }}>
        Trail Time: {trailTime}s
      </div>
      <input
        type="range"
        min={0}
        max={Math.max(...[...checkedAssets].map(id => (checkedAssetsPaths[id]?.length || 1))) - 1}
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
)}


</div>
</div>

  );
};

export default LiveTrailDashboard;