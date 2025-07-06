import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  FaFire,
  FaMapMarkerAlt,
  FaTruck,
  FaClock,
  FaMoon,
  FaSun,
  FaSearchPlus,
  FaSearchMinus,
  FaExpand,
  FaCompress,
} from 'react-icons/fa';
import { AiOutlineHeatMap } from "react-icons/ai";
import { Link, useLocation } from 'react-router-dom';


const assetMap = {
  Forklifts: ['Forklift 1', 'Forklift 2'],
  Cranes: ['Crane 1', 'Crane 2'],
  Carts: ['Cart 1', 'Cart 2'],
  'Operators/Workers': ['Worker 1', 'Operator 1'],
  'All Assets': ['Forklift 1', 'Forklift 2', 'Crane 1', 'Cart 1', 'Worker 1'],
};

const zoneCoordinates = {
  "Asset Area": { x: 20, y: 20, width: 150, height: 150 },
  "Storage Area 1": { x: 200, y: 20, width: 200, height: 200 },
  "Storage Area 2": { x: 500, y: 60, width: 200, height: 200 },
  "Service Area": { x: 650, y: 280, width: 120, height: 120 },
  "Receiving Dock": { x: 130, y: 330, width: 210, height: 120 },
  "Shipping Dock": { x: 380, y: 330, width: 220, height: 120 },
  "Office": { x: 20, y: 200, width: 90, height: 100 },
  "Canteen": { x: 20, y: 330, width: 90, height: 140 },
  "Whole Warehouse": null
};

interface HTMLElementWithFullscreen extends HTMLElement {
  mozRequestFullScreen?: () => Promise<void>;
  webkitRequestFullscreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
}

interface DocumentWithFullscreen extends Document {
  mozCancelFullScreen?: () => Promise<void>;
  webkitExitFullscreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
}

const WarehouseHeatmap = () => {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);
  const [heatmapParameter, setHeatmapParameter] = useState('time');
  const [whichZone, setWhichZone] = useState('Whole Warehouse');
  const [intensity, setIntensity] = useState(5);
  const [timeRange, setTimeRange] = useState('1 Hour');
  const [assetType, setAssetType] = useState('Forklifts');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [trailTime, setTrailTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [scale, setScale] = useState(0.9); // Default zoom out a little
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedColorFilter, setSelectedColorFilter] = useState<string | null>(null);

  // This manages the tooltip popup
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, text: '' });

  // Theme colors
  const theme = {
    background: darkMode ? '#0f0f0f' : '#f9f9f9',
    cardBackground: darkMode ? '#1a1a1a' : '#ffffff',
    textPrimary: darkMode ? '#e0e0e0' : '#003366',
    textSecondary: darkMode ? '#a0a0a0' : '#5c7ea3',
    textTertiary: darkMode ? '#888888' : '#213547',
    border: darkMode ? '#333333' : '#ccc',
    gridBackground: darkMode ? '#1f1f1f' : '#f5f5f5',
    gridLine: darkMode ? '#333333' : '#ddd',
    inputBackground: darkMode ? '#1A1A1A' : '#fdfdfd',
    legendBackground: darkMode ? '#1A1A1A' : '#f8f8f8',
    assetItemBackground: darkMode ? '#1A1A1A' : '#edf4fb',
    assetItemBorder: darkMode ? '#404040' : '#d3e5f4',
    summaryBackground1: darkMode ? '#1a2332' : '#e3f2fd',
    summaryBackground2: darkMode ? '#1a2b1a' : '#e8f5e9',
    summaryBorder1: darkMode ? '#2a4a6b' : '#90caf9',
    summaryBorder2: darkMode ? '#2a4a2a' : '#a5d6a7',
    summaryText1: darkMode ? '#64b5f6' : '#073366',
    summaryText2: darkMode ? '#81c784' : '#1b5e20',
  };

  //  Generate stable data that only changes when parameters change
  const stableHeatmapData = useMemo(() => {
    const gridData = [];
    const zone = zoneCoordinates[whichZone];
    
    // Create a seed based on the parameters to ensure consistent but different data
    const seed = `${heatmapParameter}-${whichZone}-${timeRange}-${assetType}`;
    let seedValue = 0;
    for (let i = 0; i < seed.length; i++) {
      seedValue += seed.charCodeAt(i);
    }
    
    // Simple seeded random function
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    for (let row = 0; row < 13; row++) {
      for (let col = 0; col < 19; col++) {
        const cellSeed = seedValue + row * 19 + col;
        const value = Math.floor(seededRandom(cellSeed) * 350);
        const id = `${row}-${col}`;
        const x = 40 + col * 40;
        const y = 40 + row * 36;

        if (zone) {
          const { x: zx, y: zy, width, height } = zone;
          if (x < zx || x > zx + width || y < zy || y > zy + height) continue;
        }

        gridData.push({ row, col, value, id, x, y });
      }
    }

    return gridData;
  }, [heatmapParameter, whichZone, timeRange, assetType]);

  // Generate stable asset data
  const stableAssetData = useMemo(() => {
    const seed = `${heatmapParameter}-${assetType}-${timeRange}`;
    let seedValue = 0;
    for (let i = 0; i < seed.length; i++) {
      seedValue += seed.charCodeAt(i);
    }
    
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    return assetMap[assetType as keyof typeof assetMap].map((id, index) => {
      const assetSeed = seedValue + index;
      let value: string | number = 0;
      
      if (heatmapParameter === 'time') {
        value = Math.floor(seededRandom(assetSeed) * 120);
      } else if (heatmapParameter === 'count') {
        value = Math.floor(seededRandom(assetSeed) * 50);
      } else if (heatmapParameter === 'power') {
        value = (seededRandom(assetSeed) * 100).toFixed(2);
      } else if (heatmapParameter === 'visits') {
        value = Math.floor(seededRandom(assetSeed) * 20) + 1;
      }

      return { id, value };
    });
  }, [heatmapParameter, assetType, timeRange]);

  const legendContainerStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: 20,
    right: 20,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'transparent',
    padding: 0,
    borderRadius: 0,
    boxShadow: 'none',
    zIndex: 10,
    fontSize: '12px',
    color: darkMode ? '#fff' : '#000',
    maxWidth: '90%', // Limit max width so it doesn't overflow the container
  };
  

  const legendItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    cursor: 'pointer',
  };

  const getHeatmapHeading = () => {
    switch (heatmapParameter) {
      case 'time': return 'Highest Time Heatmap';
      case 'count': return 'Highest Count Heatmap';
      case 'power': return 'Highest Power Usage Heatmap';
      case 'visits': return 'Highest Visits Heatmap';
      default: return 'Heatmap';
    }
  };

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => prev + 1);
        setTrailTime((t) => t + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying]);

  // Handle legend click functionality
  const handleLegendClick = (colorValue: string) => {
    if (selectedColorFilter === colorValue) {
      // If clicking the same color, reset to show all data
      setSelectedColorFilter(null);
    } else {
      // Filter to show only the selected color range
      setSelectedColorFilter(colorValue);
    }
  };

 
  const getColorForValue = (value: number, isHighest: boolean) => {
    if (value <= 5) {
      return '#64DA82';
    } else if (value <= 30) {
      return '#93DD45'; 
    } else if (value <= 60) {
      return '#FDE34D';
    } else if (value <= 200) {
      return '#F4A03F';
    } else {
      return isHighest ? '#2c3e50' : '#e74c3c'; // Highest red becomes dark blue-gray, others stay red
    }
  };

  // Check if a value should be shown based on color filter
  const shouldShowValue = (value: number) => {
    if (selectedColorFilter === null) return true;
    
 
    let maxValue = -1;
    
    for (const point of stableHeatmapData) {
      if (point.value > maxValue) {
        maxValue = point.value;
      }
    }
    
    const isHighest = value === maxValue && value > 200;
    const valueColor = getColorForValue(value, isHighest);
    return valueColor === selectedColorFilter;
  };

  // This handles the tooltip creation and click events
  const renderShape = (x: number, y: number, size: number, fill: string, isMax: boolean, textColor: string, textVal: string) => {
    let stroke = 'none';
    let strokeWidth = 0;
    let strokeClass = '';
    
    if (isMax) {
      strokeClass = 'animate-border';
    }
  
    const tooltipText = (() => {
      switch (heatmapParameter) {
        case 'time': return `${textVal} time spent in this area.`;
        case 'count': return `${textVal} people in this area.`;
        case 'power': return `${textVal} kWh power usage in this area.`;
        case 'visits': return `${textVal} visits in this area.`;
        default: return '';
      }
    })();
  
    // Includes the onClick handler for tooltip
    const shapeProps = {
      fill,
      stroke,
      strokeWidth,
      opacity: 0.85,
      className: strokeClass,
      style: { cursor: 'pointer' }, 
      onClick: (e: React.MouseEvent) => {

        //  Shows tooltip at cursor position
        setTooltip({
          visible: true,
          x: e.clientX,
          y: e.clientY,
          text: tooltipText,
        });
        
        
        setTimeout(() => {
          setTooltip({ visible: false, x: 0, y: 0, text: '' });
        }, 3000);
      },
    };
  
    if (heatmapParameter === 'visits') {
      return (
        <g key={`${x}-${y}`}>
          <rect
            x={x - size}
            y={y - size}
            width={size * 2}
            height={size * 2}
            rx={3}
            {...shapeProps}
          />
          <text x={x} y={y + 4} fill={textColor} fontSize="10" textAnchor="middle" fontWeight="bold">{textVal}</text>
        </g>
      );
    } else if (heatmapParameter === 'count') {
      const points = [
        [x, y - size],
        [x + 0.87 * size, y - size / 2],
        [x + 0.87 * size, y + size / 2],
        [x, y + size],
        [x - 0.87 * size, y + size / 2],
        [x - 0.87 * size, y - size / 2]
      ].map(p => p.join(',')).join(' ');
      return (
        <g key={`${x}-${y}`}>
          <polygon points={points} {...shapeProps} />
          <text x={x} y={y + 4} fill={textColor} fontSize="10" textAnchor="middle" fontWeight="bold">{textVal}</text>
        </g>
      );
    } else if (heatmapParameter === 'power') {
      const angle = (2 * Math.PI) / 5;
      const points = Array.from({ length: 5 }).map((_, i) => {
        const px = x + size * Math.sin(i * angle);
        const py = y - size * Math.cos(i * angle);
        return `${px},${py}`;
      }).join(' ');
      return (
        <g key={`${x}-${y}`}>
          <polygon points={points} {...shapeProps} />
          <text x={x} y={y + 4} fill={textColor} fontSize="10" textAnchor="middle" fontWeight="bold">{textVal}</text>
        </g>
      );
    } else {
      return (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r={size} {...shapeProps} />
          <text x={x} y={y + 4} fill={textColor} fontSize="10" textAnchor="middle" fontWeight="bold">{textVal}</text>
        </g>
      );
    }
  };
  
  // GENERATE HEATMAP CIRCLES - uses stable data
  const generateHeatmapCircles = () => {
    const renderedShapes = [];
    
    // Find max value for highlighting
    let maxValue = -1;
    let maxId = null;
    
    for (const point of stableHeatmapData) {
      if (point.value > maxValue) {
        maxValue = point.value;
        maxId = point.id;
      }
    }
    
    // Render shapes
    for (const point of stableHeatmapData) {
      const { x, y, id, value } = point;

      // Skip if color filter is active and this value doesn't match
      if (!shouldShowValue(value)) continue;
  
      const isHighest = id === maxId && value === maxValue && value > 200;
      let fill = getColorForValue(value, isHighest);
      let textColor = '#000';
      
      if (value > 200) {
        textColor = '#fff';
      }
      if (value <= 5) {
        textColor = '#fff';
      }
      if (isHighest) {
        textColor = '#fff';
      }
  
      const show =
        (value <= 5 && intensity >= 1) ||
        (value <= 30 && intensity >= 2) ||
        (value <= 60 && intensity >= 4) ||
        (value <= 200 && intensity >= 6) ||
        (value > 200 && intensity >= 8);
  
      if (!show) continue;
  
      const isMax = id === maxId && value === maxValue;
      const size = isMax ? 20 : 17;
  
      const textVal =
        heatmapParameter === 'time' ? `${value}s` :
        heatmapParameter === 'count' ? `${value}` :
        heatmapParameter === 'power' ? `${value}` :
        `${value}`;
  
      renderedShapes.push(renderShape(x, y, size, fill, isMax, textColor, textVal));
    }
  
    return renderedShapes;
  };

  // Handle zoom in functionality
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 2));
  };

  // Handle zoom out functionality
  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };

  // Handle full screen toggle
  const handleFullScreenToggle = () => {
    const mapContainer = document.getElementById('warehouse-map-container') as HTMLElementWithFullscreen;
    const doc = document as DocumentWithFullscreen;
    
    if (!isFullScreen) {
      if (mapContainer?.requestFullscreen) {
        mapContainer.requestFullscreen();
      } else if (mapContainer?.mozRequestFullScreen) { // Firefox
        mapContainer.mozRequestFullScreen();
      } else if (mapContainer?.webkitRequestFullscreen) { // Chrome, Safari and Opera
        mapContainer.webkitRequestFullscreen();
      } else if (mapContainer?.msRequestFullscreen) { // IE/Edge
        mapContainer.msRequestFullscreen();
      }
      setIsFullScreen(true);
    } else {
      if (doc.exitFullscreen) {
        doc.exitFullscreen();
      } else if (doc.mozCancelFullScreen) { // Firefox
        doc.mozCancelFullScreen();
      } else if (doc.webkitExitFullscreen) { // Chrome, Safari and Opera
        doc.webkitExitFullscreen();
      } else if (doc.msExitFullscreen) { // IE/Edge
        doc.msExitFullscreen();
      }
      setIsFullScreen(false);
    }
  };

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  return (
    <div style={{ height: '100vh', width: '100vw', overflow: 'hidden', display: 'flex', flexDirection: 'column', fontFamily: 'times new roman', backgroundColor: theme.background }}>
      <div style={{  padding: '4px 20px', marginBottom: 1, marginTop:'2px',backgroundColor: theme.cardBackground, boxShadow: darkMode ? '0 2px 4px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.05)', position: 'relative' }}>
        <h1 style={{ fontSize: '1.8rem', color: theme.textPrimary, margin: 0 }}>Phantom Trail</h1>
        <p style={{ fontSize: '1rem', color: theme.textSecondary, margin: 0 }}>Warehouse</p>
       
        
        <div style={{
          position: 'absolute',
          top: '17px',
          right: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          fontWeight: '700'
        }}>
          {/* Live Trail Link */}
          <Link
            to="/dashboard"
            style={{
              textDecoration: 'none',
              color: location.pathname === '/dashboard' ? '#fff' : (darkMode ? '#ffffff' : '#000000'),
              backgroundColor: location.pathname === '/dashboard' ? '#003366' : 'transparent',
              padding: '6px 10px',
              border: `1px solid ${location.pathname === '/dashboard' ? '#003366' : (darkMode ? '#555' : '#ccc')}`,
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
              borderRadius: '10px',
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

      {/*left panel */}    
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{
          flexBasis: isFullScreen ? '100%' : '75%',
          padding: 16,
          backgroundColor: theme.cardBackground, 
          position: 'relative',
        }}>

          <div 
            id="warehouse-map-container"
            style={{
              height: 'calc(100% - 10px)',
              borderRadius: 10,
              border: `2px solid ${theme.border}`,
              padding: 0,
              background: theme.gridBackground, 
              position: 'relative',
              boxShadow: darkMode
                ? 'inset 0 0 8px rgba(0,0,0,0.2)'
                : 'inset 0 0 8px rgba(0,0,0,0.05)',
              overflow: 'hidden'
            }}
          >  

            <div style={{
              height: '100%',
              width: '100%',
              backgroundColor: darkMode ? '#1a1a1a' : '#fff',  
              backgroundImage: darkMode
                ? `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)` // ✅ SOFT WHITE GRID IN DARK
                : `linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)`,
              backgroundSize: '20px 20px',
              borderRadius: 10,
              overflow: 'hidden'
            }}>

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
                    color: darkMode ? '#fff' : '#000',
                    opacity: 0.7,
                    transition: 'opacity 0.2s ease',
                  }}
                  onClick={handleZoomIn}
                  title="Zoom In"
                  size={18}
                  onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseOut={(e) => e.currentTarget.style.opacity = '0.7'}
                />
                <FaSearchMinus
                  style={{ 
                    cursor: 'pointer',
                    color: darkMode ? '#fff' : '#000',
                    opacity: 0.7,
                    transition: 'opacity 0.2s ease',
                  }}
                  onClick={handleZoomOut}
                  title="Zoom Out"
                  size={18}
                  onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseOut={(e) => e.currentTarget.style.opacity = '0.7'}
                />
                {isFullScreen ? (
                  <FaCompress
                    style={{ 
                      cursor: 'pointer',
                      color: darkMode ? '#fff' : '#000',
                      opacity: 0.7,
                      transition: 'opacity 0.2s ease',
                    }}
                    onClick={handleFullScreenToggle}
                    title="Exit Full Screen"
                    size={18}
                    onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseOut={(e) => e.currentTarget.style.opacity = '0.7'}
                  />
                ) : (
                  <FaExpand
                    style={{ 
                      cursor: 'pointer',
                      color: darkMode ? '#fff' : '#000',
                      opacity: 0.7,
                      transition: 'opacity 0.2s ease',
                    }}
                    onClick={handleFullScreenToggle}
                    title="Full Screen"
                    size={18}
                    onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseOut={(e) => e.currentTarget.style.opacity = '0.7'}
                  />
                )}
              </div>

              <div style={{
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                transition: 'transform 0.3s ease-in-out',
                width: '100%',
                height: '100%',
                position: 'relative'
              }}>

                <svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 800 500">
                  <style>
                    {`
                      .glow {
                        stroke: ${darkMode ? '#fff' : '#000'};
                        stroke-width: 1.5;
                        filter: url(#glowFilter);
                      }

                      .animate-border {
                        stroke: ${darkMode ? '#fff' : '#000'};
                        stroke-width: 2;
                        stroke-dasharray: 70;
                        stroke-dashoffset: 70;
                        animation: drawBorder 1.2s ease-out forwards;
                      }

                      @keyframes drawBorder {
                        to {
                          stroke-dashoffset: 0;
                        }
                      }
                    `}
                  </style>

                  <defs>
                    <filter id="glowFilter" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* ROOM ZONES */}
                  <rect x="20" y="20" width="150" height="150" fill={darkMode ? "#1a2833" : "#e6f2ff"} stroke={darkMode ? "#4a90e2" : "#005cbf"} strokeDasharray="6" strokeWidth="1.5" />
                  <text x="90" y="95" fill={darkMode ? "#64b5f6" : "#003366"} fontSize="12" textAnchor="middle">Asset Area</text>

                  <rect x="200" y="20" width="200" height="200" fill={darkMode ? "#1a2b1a" : "#e8f5e9"} stroke={darkMode ? "#4caf50" : "#2e7d32"} strokeDasharray="6" strokeWidth="1.5" />
                  <text x="295" y="120" fill={darkMode ? "#81c784" : "#1b5e20"} fontSize="12" textAnchor="middle">Storage Area 1</text>

                  <rect x="500" y="60" width="200" height="200" fill={darkMode ? "#1a2b1a" : "#e8f5e9"} stroke={darkMode ? "#4caf50" : "#2e7d32"} strokeDasharray="6" strokeWidth="1.5" />
                  <text x="595" y="165" fill={darkMode ? "#81c784" : "#1b5e20"} fontSize="12" textAnchor="middle">Storage Area 2</text>

                  <rect x="650" y="280" width="120" height="120" fill={darkMode ? "#2b2416" : "#fff8e1"} stroke={darkMode ? "#ffc107" : "#f9a825"} strokeDasharray="6" strokeWidth="1.5" />
                  <text x="710" y="345" fill={darkMode ? "#ffb74d" : "#ef6c00"} fontSize="12" textAnchor="middle">Service Area</text>

                  <rect x="140" y="330" width="220" height="120" fill={darkMode ? "#2b1a2b" : "#f3e5f5"} stroke={darkMode ? "#ba68c8" : "#8e24aa"} strokeDasharray="6" strokeWidth="1.5" />
                  <text x="240" y="400" fill={darkMode ? "#ce93d8" : "#6a1b9a"} fontSize="12" textAnchor="middle">Receiving Dock</text>

                  <rect x="380" y="330" width="220" height="120" fill={darkMode ? "#2b1a2b" : "#f3e5f5"} stroke={darkMode ? "#ba68c8" : "#8e24aa"} strokeDasharray="6" strokeWidth="1.5" />
                  <text x="480" y="400" fill={darkMode ? "#ce93d8" : "#6a1b9a"} fontSize="12" textAnchor="middle">Shipping Dock</text>

                  <rect x="20" y="200" width="90" height="100" fill={darkMode ? "#2b1a21" : "#fce4ec"} stroke={darkMode ? "#e91e63" : "#ad1457"} strokeDasharray="6" strokeWidth="1.5" />
                  <text x="60" y="260" fill={darkMode ? "#f48fb1" : "#880e4f"} fontSize="12" textAnchor="middle">Office</text>

                  <rect x="20" y="330" width="90" height="140" fill={darkMode ? "#1a2b2b" : "#e0f7fa"} stroke={darkMode ? "#26c6da" : "#00838f"} strokeDasharray="6" strokeWidth="1.5" />
                  <text x="60" y="410" fill={darkMode ? "#4dd0e1" : "#006064"} fontSize="12" textAnchor="middle">Canteen</text>

                  {/* Heatmap dots */}
                  <g>{generateHeatmapCircles()}</g>
                </svg>
              </div>

              {/* Legends */}
              {heatmapParameter === 'time' && (
                <div style={legendContainerStyle}>
                  {[
                    { color: '#64DA82', label: 'Low Time' },
                    { color: '#93DD45', label: 'Less Time' },
                    { color: '#FDE34D', label: 'Moderate' },
                    { color: '#F4A03F', label: 'High Time' },
                    { color: '#e74c3c', label: 'Higher Time' },
                    { color: '#2c3e50', label: 'Highest Time' },
                  ].map((item, index) => (
                    <div 
                      key={index} 
                      style={{
                        ...legendItemStyle,
                        opacity: selectedColorFilter === null || selectedColorFilter === item.color ? 1 : 0.5,
                      }}
                      onClick={() => handleLegendClick(item.color)}
                    >
                      <div style={{
                        width: 14, height: 14, borderRadius: '50%',
                        backgroundColor: item.color,
                      }}></div>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {heatmapParameter === 'count' && (
                <div style={legendContainerStyle}>
                  {[

                    { color: '#64DA82', label: '0-5 people' },
                    { color: '#93DD45', label: '6–30 people' },
                    { color: '#FDE34D', label: '31–60 people' },
                    { color: '#F4A03F', label: '61–200 people' },
                    { color: '#e74c3c', label: ' >200 people' },
                    { color: '#2c3e50', label: 'Highest Count' },
                  ].map((item, index) => (
                    <div 
                      key={index} 
                      style={{
                        ...legendItemStyle,
                        opacity: selectedColorFilter === null || selectedColorFilter === item.color ? 1 : 0.5,
                      }}
                      onClick={() => handleLegendClick(item.color)}
                    >
                      <div style={{
                        width: 20, height: 20, backgroundColor: item.color,
                        border: (item.color === '#9b59b6' || item.color === '#2c3e50') ? `2px solid ${darkMode ? '#fff' : '#222'}` : 'none',
                        clipPath: 'polygon(50% 0%, 95% 38%, 79% 95%, 21% 95%, 5% 38%)'
                      }}></div>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {heatmapParameter === 'power' && (
                <div style={legendContainerStyle}>
                  {[
               
                    { color: '#64DA82', label: '0-9 kwh' },
                    { color: '#93DD45', label: '10–30 kWh' },
                    { color: '#FDE34D', label: '31–60 kWh' },
                    { color: '#F4A03F', label: '61–200 kWh' },
                    { color: '#e74c3c', label: '>200 kwh' },
                    { color: '#2c3e50', label: 'Highest Power' },
                  ].map((item, index) => (
                    <div 
                      key={index} 
                      style={{
                        ...legendItemStyle,
                        opacity: selectedColorFilter === null || selectedColorFilter === item.color ? 1 : 0.5,
                      }}
                      onClick={() => handleLegendClick(item.color)}
                    >
                      <div style={{
                        width: 20, height: 20, backgroundColor: item.color,
                        border: (item.color === '#9b59b6' || item.color === '#2c3e50') ? `2px solid ${darkMode ? '#fff' : '#222'}` : 'none',
                        clipPath: 'polygon(50% 0%, 95% 38%, 79% 95%, 21% 95%, 5% 38%)'
                      }}></div>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {heatmapParameter === 'visits' && (
                <div style={legendContainerStyle}>
                  {[
               
                    { color: '#64DA82', label: '0-5 Visits' },
                    { color: '#93DD45', label: '6–30 visits' },
                    { color: '#FDE34D', label: '31–60 visits' },
                    { color: '#F4A03F', label: '61–200 visits' },
                    { color: '#e74c3c', label: '>200 Visits' },
                    { color: '#2c3e50', label: 'Highest Visits' },
                  ].map((item, index) => (
                    <div 
                      key={index} 
                      style={{
                        ...legendItemStyle,
                        opacity: selectedColorFilter === null || selectedColorFilter === item.color ? 1 : 0.5,
                      }}
                      onClick={() => handleLegendClick(item.color)}
                    >
                      <div style={{
                        width: 14, height: 14, backgroundColor: item.color,
                        border: (item.color === '#9b59b6' || item.color === '#2c3e50') ? `2px solid ${darkMode ? '#fff' : '#222'}` : 'none'
                      }}></div>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Dynamic Heatmap Heading */}
              <div style={{ textAlign: 'center', fontWeight: 900, fontSize: 15, color: theme.textTertiary, marginTop: 6, textTransform: 'uppercase'}}>
                {getHeatmapHeading()} ({whichZone})
              </div>

              {/* actual tooltip */}
              {tooltip.visible && (
                <div
                  style={{
                    position: 'fixed',
                    top: tooltip.y + 20,
                    left: tooltip.x + 20,
                    backgroundColor: darkMode ? '#333' : '#000',
                    color: '#fff',
                    padding: '8px 12px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    pointerEvents: 'none',
                    zIndex: 9999,
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    transition: 'all 0.2s ease-out',
                    border: `1px solid ${darkMode ? '#555' : '#333'}`,
                    maxWidth: '250px',
                  }}
                >
                  {tooltip.text}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* right panel */}
        <div style={{ 
          flexBasis: isFullScreen ? '0%' : '25%', 
          padding: isFullScreen ? 0 : 16, 
          backgroundColor: darkMode ? '#1a1a1a' : '#ffffff', 
          overflowY: 'auto',
          display: isFullScreen ? 'none' : 'block',
          border: `1px solid ${theme.border}`,
          borderRadius: 0,
          boxShadow: darkMode ? 'inset 2px 0 4px rgba(0,0,0,0.3)' : 'inset 2px 0 4px rgba(0,0,0,0.1)',
        }}>

          {/* Unified Inner Panel */}
          <div style={{
            backgroundColor: darkMode ? '#2a2a2a' : '#F8F9FA', 
            padding: 16,
            borderRadius: 20,
            border: `1px solid ${darkMode ? '#555' : '#ccc'}`,
            boxShadow: 'inset 0 1px 6px rgba(0,0,0,0.06)',
            marginBottom: 20,
          }}>

            {/* Time Range + Asset Type */}
<div style={{
  marginBottom: 16,
  padding: 16,
  backgroundColor: darkMode ? '#333333' : '#F8F9FA',
  borderRadius: 12,
  border: `1px solid ${darkMode ? '#555' : '#dee2e6'}`,
  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
}}>
  
  {/* Time Range Section */}
  <div style={{ marginBottom: 16 }}>
    <label style={{ fontWeight: 700, color: theme.textPrimary, display: 'flex', alignItems: 'center', marginBottom: 8 }}>
      <FaClock style={{ marginRight: 6 }} /> Time Range
    </label>
    <select
      value={timeRange}
      onChange={(e) => setTimeRange(e.target.value)}
      style={{
        width: '100%',
        padding: '10px 12px',
        borderRadius: 16,
        border: `1px solid ${theme.border}`,
        backgroundColor: darkMode ? '#4a4a4a' : '#ffffff',
        color: theme.textPrimary,
        fontWeight: 500
      }}
    >
      <option>1 Hour</option>
      <option>4 Hours</option>
      <option>24 Hours</option>
    </select>
  </div>

  {/* Asset Type Section */}
  <div>
    <label style={{ fontWeight: 700, color: theme.textPrimary, display: 'flex', alignItems: 'center', marginBottom: 8 }}>
      <FaTruck style={{ marginRight: 6 }} /> Asset Type
    </label>
    <select
      value={assetType}
      onChange={(e) => {
        setAssetType(e.target.value);
        setSelectedAssetId(null);
      }}
      style={{
        width: '100%',
        padding: '10px 12px',
        borderRadius: 16,
        border: `1px solid ${theme.border}`,
        backgroundColor: darkMode ? '#4a4a4a' : '#ffffff',
        color: theme.textPrimary,
        fontWeight: 500
      }}
    >
      <option>Forklifts</option>
      <option>Cranes</option>
      <option>Carts</option>
      <option>Operators/Workers</option>
      <option>All Assets</option>
    </select>
  </div>
</div>


            

            {/* Select Zone and Floor */}
            <div style={{
              display: 'flex',
              gap: 10,
              marginBottom: 16,
              padding: 16,
              backgroundColor: darkMode ? '#333333' : '#F8F9FA',
              borderRadius: 12,
              border: `1px solid ${darkMode ? '#555' : '#dee2e6'}`,
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 700, color: theme.textPrimary, marginBottom: 8, display: 'block' }}>
                  Select Zone
                </label>
                <select value={whichZone} onChange={(e) => setWhichZone(e.target.value)} style={{
                  width: '100%', padding: '10px 12px', borderRadius: 16, border: `1px solid ${theme.border}`,
                  backgroundColor: darkMode ? '#4a4a4a' : '#ffffff', color: theme.textPrimary, fontWeight: 500
                }}>
                  <option>Asset Area</option>
                  <option>Storage Area 1</option>
                  <option>Storage Area 2</option>
                  <option>Office</option>
                  <option>Canteen</option>
                  <option>Receiving Dock</option>
                  <option>Shipping Dock</option>
                  <option>Service Area</option>
                  <option>Whole Warehouse</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 700, color: theme.textPrimary, marginBottom: 8, display: 'block' }}>
                  Select Floor
                </label>
                <select value={whichZone} onChange={(e) => setWhichZone(e.target.value)} style={{
                  width: '100%', padding: '10px 12px', borderRadius: 16, border: `1px solid ${theme.border}`,
                  backgroundColor: darkMode ? '#4a4a4a' : '#ffffff', color: theme.textPrimary, fontWeight: 500
                }}>
                  <option>Floor 1</option>
                  <option>Floor 2</option>
                  <option>Floor 3</option>
                </select>
              </div>
            </div>

            {/* Heatmap Parameter + Intensity + Details */}
            <div style={{
              padding: 16,
              backgroundColor: darkMode ? '#333333' : '#F8F9FA',
              borderRadius: 12,
              border: `1px solid ${darkMode ? '#555' : '#dee2e6'}`,
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
              marginBottom: 16
            }}>
              <label style={{ fontWeight: 700, color: theme.textPrimary, display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <FaFire style={{ marginRight: 6 }} /> Heatmap Parameter
              </label>
              <select
                value={heatmapParameter}
                onChange={(e) => setHeatmapParameter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 16,
                  border: `1px solid ${theme.border}`,
                  backgroundColor: darkMode ? '#4a4a4a' : '#ffffff',
                  color: theme.textPrimary,
                  fontWeight: 500,
                }}
              >
                <option value="time">Highest Time</option>
                <option value="count">Highest Count</option>
                <option value="power">Highest Power Usage</option>
                <option value="visits">Highest Visits</option>
              </select>

              <label style={{ fontWeight: 700, color: theme.textPrimary, display: 'block', margin: '10px 0 4px' }}>Adjust Intensity</label>
              <input
                type="range"
                min={1}
                max={10}
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                style={{
                  width: '100%',
                  appearance: 'none',
                  height: '8px',
                  borderRadius: '4px',
                  outline: 'none',
                  background: 'linear-gradient(to right, #b9f6ca 0%, #00c853 25%, #ffeb3b 50%, #ff9800 75%, #f44336 100%)',
                }}
              />
              <div style={{ textAlign: 'right', fontSize: 13, fontWeight: 700, marginTop: 5, color: theme.textSecondary }}>
                Intensity: {intensity}
              </div>

              {/* Heatmap Details */}
              <div style={{ marginTop: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: theme.textPrimary, display: 'flex', alignItems: 'center' }}>
                  <AiOutlineHeatMap style={{ marginRight: 5, fontSize: 18, color: theme.textPrimary }} />
                  Heatmap Details
                </h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {stableAssetData.map(({ id, value }, index) => (
                    <li
                      key={index}
                      style={{
                        marginBottom: 5,
                        padding: '10px 14px',
                        borderRadius: 14,
                        backgroundColor: darkMode ? '#4a4a4a' : '#ffffff',
                        fontSize: 14,
                        fontWeight: 600,
                        color: theme.textPrimary,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        border: `1px solid ${theme.border}`,
                      }}
                    >
                      <span>{id}</span>
                      <span>
                        {heatmapParameter === 'time' && `${value} seconds`}
                        {heatmapParameter === 'count' && `${value} people`}
                        {heatmapParameter === 'power' && `${value} kWh`}
                        {heatmapParameter === 'visits' && `${value} visits`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <div
              style={{
                flex: 1,
                backgroundColor: theme.summaryBackground1,
                padding: '14px 18px',
                borderRadius: 18,
                boxShadow: '0 4px 10px rgba(0, 123, 255, 0.1)',
                border: `1px solid ${theme.summaryBorder1}`,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 14, color: theme.summaryText1, marginBottom: 6 }}>Total Zones</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: theme.summaryText1 }}>20</div>
            </div>
            <div
              style={{
                flex: 1,
                backgroundColor: theme.summaryBackground2,
                padding: '14px 18px',
                borderRadius: 18,
                boxShadow: '0 4px 10px rgba(76, 175, 80, 0.1)',
                border: `1px solid ${theme.summaryBorder2}`,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 14, color: theme.summaryText2, marginBottom: 6 }}>Active Assets</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: theme.summaryText2 }}>20</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarehouseHeatmap;