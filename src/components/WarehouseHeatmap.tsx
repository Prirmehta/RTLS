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
import { IoSunny } from "react-icons/io5";
import { HiMoon } from "react-icons/hi2";
import { GiTrail } from "react-icons/gi";




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
  const [scale, setScale] = useState(0.9);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedColorFilter, setSelectedColorFilter] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedHeatmap, setSelectedHeatmap] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [isHeatmapHovered, setIsHeatmapHovered] = useState(false);
  const heatmapRef = useRef(null);
  const [heatmapOption, setHeatmapOption] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });
  

  useEffect(() => {
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);
  

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
 
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (heatmapRef.current && !heatmapRef.current.contains(event.target)) {
        setIsHeatmapHovered(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, text: '' });

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

  // Generate stable data that only changes when parameters change
  const stableHeatmapData = useMemo(() => {
    const gridData = [];
    const zone = zoneCoordinates[whichZone];
    
    const seed = `${heatmapParameter}-${whichZone}-${timeRange}-${assetType}`;
    let seedValue = 0;
    for (let i = 0; i < seed.length; i++) {
      seedValue += seed.charCodeAt(i);
    }
    
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

  const getLegendColors = (darkMode: boolean) => {
    return [
      { color: darkMode ? '#64DA82' : '#BFFF00', label: '0–5' },        // 0–5
      { color: darkMode ? '#48BF91' : '#93DD45', label: '6–30' },             // 6–30
      { color: darkMode ? '#00D4FF' : '#FDE34D', label: '31–60' },        // 31–60
      { color: darkMode ? '#6C5DD3' : '#F4A03F', label: '61–200' },            // 61–200
      { color: darkMode ? '#FF4D6D' : '#e74c3c', label: '>200' },          // >200
      { color: darkMode ? '#B2BABB' : '#2c3e50', label: 'Highest' }          // Highest
    ];
  };
  

  const legendContainerStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: isMobile ? 10 : 20,
    left: isMobile ? 10 : 20,
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: isMobile ? 'flex-end' : 'center',
    gap: isMobile ? 8 : 14,
    backgroundColor: 'transparent',
    padding: 0,
    borderRadius: 0,
    boxShadow: 'none',
    zIndex: 10,
    fontSize: isMobile ? '10px' : '12px',
    color: darkMode ? '#fff' : '#000',
    maxWidth: isMobile ? '40%' : '90%',
  };

  const legendItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? 4 : 6,
    cursor: 'pointer',
  };
  const handleReset = () => {
    setScale(0.8);           // Reset zoom level to default
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

  const handleLegendClick = (colorValue: string) => {
    if (selectedColorFilter === colorValue) {
      setSelectedColorFilter(null);
    } else {
      setSelectedColorFilter(colorValue);
    }
  };

  const getColorForValue = (value: number, isHighest: boolean) => {
    if (value <= 5) {
      return darkMode ? '#64DA82' : '#BFFF00'; // Mint vs Lime
    } else if (value <= 30) {
      return darkMode ? '#48BF91' : '#93DD45'; // Teal vs Parrot Green
    } else if (value <= 60) {
      return darkMode ? '#00D4FF' : '#FDE34D'; // Aqua vs Yellow
    } else if (value <= 200) {
      return darkMode ? '#6C5DD3' : '#F4A03F'; // Violet vs Orange
    } else {
      return isHighest
        ? darkMode ? '#B2BABB' : '#2c3e50'     // Grey tone for peak
        : darkMode ? '#FF4D6D' : '#e74c3c';    // Neon pink vs Red
    }
  };
  

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
  
    const shapeProps = {
      fill,
      stroke,
      strokeWidth,
      opacity: 0.85,
      className: strokeClass,
      style: { cursor: 'pointer' }, 
      onClick: (e: React.MouseEvent) => {
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
  
  const generateHeatmapCircles = () => {
    const renderedShapes = [];
    
    let maxValue = -1;
    let maxId = null;
    
    for (const point of stableHeatmapData) {
      if (point.value > maxValue) {
        maxValue = point.value;
        maxId = point.id;
      }
    }
    
    for (const point of stableHeatmapData) {
      const { x, y, id, value } = point;

      if (!shouldShowValue(value)) continue;
  
      const isHighest = id === maxId && value === maxValue && value > 200;
      let fill = getColorForValue(value, isHighest);
      let textColor = '#000';
      
      if (value > 200) {
        textColor = '#000';
      }
      if (value <= 5) {
        textColor = '#000';
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
        heatmapParameter === 'time' ? `${value}` :
        heatmapParameter === 'count' ? `${value}` :
        heatmapParameter === 'power' ? `${value}` :
        `${value}`;
  
      renderedShapes.push(renderShape(x, y, size, fill, isMax, textColor, textVal));
    }
  
    return renderedShapes;
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleFullScreenToggle = () => {
    const mapContainer = document.getElementById('warehouse-map-container') as HTMLElementWithFullscreen;
    const doc = document as DocumentWithFullscreen;
    
    if (!isFullScreen) {
      if (mapContainer?.requestFullscreen) {
        mapContainer.requestFullscreen();
      } else if (mapContainer?.mozRequestFullScreen) {
        mapContainer.mozRequestFullScreen();
      } else if (mapContainer?.webkitRequestFullscreen) {
        mapContainer.webkitRequestFullscreen();
      } else if (mapContainer?.msRequestFullscreen) {
        mapContainer.msRequestFullscreen();
      }
      setIsFullScreen(true);
    } else {
      if (doc.exitFullscreen) {
        doc.exitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
      setIsFullScreen(false);
    }
  };

  

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
    <div style={{ 
      height: '100vh', 
      width: '100vw', 
      overflow: isMobile ? 'auto' : 'hidden', 
      display: 'flex', 
      flexDirection: 'column', 
      fontFamily: 'Libertinus Math', 
      backgroundColor: theme.background 
    }}>
      <style>
        {`
          @media (max-width: 768px) {
            .mobile-stack {
              flex-direction: column !important;
            }
            .mobile-scroll {
              overflow-x: auto !important;
              overflow-y: hidden !important;
            }
            .mobile-full-width {
              flex-basis: 100% !important;
            }
            .mobile-hide-on-fullscreen {
              display: ${isFullScreen ? 'none' : 'block'} !important;
            }
            .mobile-map-container {
              height: 50vh !important;
              min-height: 300px !important;
            }
          }
        `}
      </style>
      <div style={{  
  padding: '4px 20px', 
  backgroundColor: theme.cardBackground,
  position: 'relative' 
}}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <GiTrail 
      size={isMobile ? 20 : 24} 
      color={darkMode ? '#00ACC1' : '#990F02'} 
    />
    
    {/* Text block with Phantom Trail + Warehouse */}
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ 
        fontSize: isMobile ? '1.4rem' : '1.8rem', 
        color: darkMode ? '#00ACC1' : '#9A2A2A',
        margin: 0 
      }}>
        Phantom Trail
      </h1>
      <p style={{ 
        fontSize: isMobile ? '0.8rem' : '1rem',
        fontWeight: 'bolder', 
        color: darkMode ? '#CFD8DC' : '#36454F',
        margin: 0,
        marginTop: 2
      }}>
        Warehouse
      </p>
    </div>
  </div>



       {/*navbar*/}


       <div style={{
      position: 'absolute',
      top: 20,
      right: 21, // shifted 30px more to the right
      zIndex: 1000,
      display: 'flex',
      gap: '20px',
      alignItems: 'center',
      fontWeight: 700,
      fontSize: 15
    }}>
      
      {/* Action Trail */}
      <Link
        to="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          fontWeight: 700,
          gap: '5px',
          color: location.pathname === '/' ? '#157AF6' : (darkMode ? '#ffffff' : '#000000'),
          cursor: 'pointer',
          transition: 'color 0.3s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#4B9DF7'}
        onMouseLeave={e => e.currentTarget.style.color = location.pathname === '/' ? '#157AF6' : (darkMode ? '#ffffff' : '#000000')}
      >
        <FaMapMarkerAlt size={14} />
        Action Trail
      </Link>

      {/* Heatmap with Dropdown */}
      <div
        ref={heatmapRef}
        onMouseEnter={() => setIsHeatmapHovered(true)}
        onMouseLeave={() => setIsHeatmapHovered(true)}
        style={{ position: 'relative', cursor: 'pointer' }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            color: isHeatmapHovered || location.pathname === '/heatmap' ? '#F28D3C' : (darkMode ? '#ffffff' : '#000000'),
            fontWeight: isHeatmapHovered || location.pathname === '/heatmap' ? 800 : 700,
            transition: 'color 0.3s ease',
          }}
        >
          <FaFire size={14} />
          Heatmap ▾
        </div>

        {/* Dropdown */}
        {isHeatmapHovered && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 9,
            backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
            border: `1px solid ${darkMode ? '#555' : '#ddd'}`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            borderRadius: 6,
            marginTop: 6,
            padding: '2px 0',
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
                  padding: '8px 16px',
                  color: heatmapOption === option ? '#F28D3C' : (darkMode ? '#fff' : '#000'),
                  backgroundColor: heatmapOption === option ? '#F28D3C22' : 'transparent',
                  fontSize: '14px',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  display: 'block',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#F28D3C'}
                onMouseLeave={e => {
                  e.currentTarget.style.color = heatmapOption === option ? '#F28D3C' : (darkMode ? '#fff' : '#000');
                }}
              >
                {option}
              </Link>
            ))}
          </div>
        )}
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
    marginLeft: '1px',
  }}
>
  {/* Sliding Icon + White Background */}
  <div
    style={{
      position: 'absolute',
      top: '50%',
      left: darkMode ? '26px' : '4px',
      transform: 'translateY(-50%)',
      transition: 'left 0.4s ease-in-out',
      width: '22px',
      height: '22px',
      borderRadius: '50%',
      backgroundColor: '#ffffff', // ✅ White circle background
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    }}
  >
    {darkMode ? (
      <HiMoon
        size={18}
        style={{
          color: '#3b0764',
          transform: 'scaleX(-1)',
          transition: 'opacity 0.3s ease-in-out',
        }}
      />
    ) : (
      <IoSunny
        size={18}
        style={{
          color: '#f59e0b',
          transition: 'opacity 0.3s ease-in-out',
        }}
      />
    )}
  </div>
</div>
</div>
</div>



      <div className={isMobile ? 'mobile-stack' : ''} style={{ 
        display: 'flex', 
        flex: 1, 
        overflow: 'hidden',
        flexDirection: isMobile ? 'column' : 'row'
      }}>
        <div className={isMobile ? 'mobile-full-width mobile-map-container' : ''} style={{
          flexBasis: isFullScreen ? '100%' : (isMobile ? 'auto' : '75%'),
          padding: isMobile ? 8 : 16,
          backgroundColor: theme.cardBackground, 
          position: 'relative',
        }}>

          <div 
            id="warehouse-map-container"
            className={isMobile ? 'mobile-scroll' : ''}
            style={{
              height: isMobile ? '100%' : 'calc(100% - 10px)',
              borderRadius: 10,
              border: `2px solid ${theme.border}`,
              padding: 0,
              background: theme.gridBackground, 
              position: 'relative',
              boxShadow: darkMode
                ? 'inset 0 0 8px rgba(0,0,0,0.2)'
                : 'inset 0 0 8px rgba(0,0,0,0.05)',
              overflow: isMobile ? 'auto' : 'hidden',
            }}
          >  

            <div style={{
              height: '100%',
              width: isMobile ? '800px' : '100%',
              minWidth: isMobile ? '800px' : 'auto',
              backgroundColor: darkMode ? '#1a1a1a' : '#fff',  
              backgroundImage: darkMode
                ? `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`
                : `linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)`,
              backgroundSize: '20px 20px',
              borderRadius: 10,
              overflow: 'hidden'
            }}>

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
}}>
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
}}>
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
    onMouseOver={e => e.currentTarget.style.opacity = 1}
    onMouseOut={e => e.currentTarget.style.opacity = 0.9}
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
    onMouseOver={e => e.currentTarget.style.opacity = 1}
    onMouseOut={e => e.currentTarget.style.opacity = 0.9}
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
      onMouseOver={e => e.currentTarget.style.opacity = 1}
      onMouseOut={e => e.currentTarget.style.opacity = 0.9}
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
      onMouseOver={e => e.currentTarget.style.opacity = 1}
      onMouseOut={e => e.currentTarget.style.opacity = 0.9}
    />
  )}

  {/* Reset Button */}
  <button
    onClick={handleReset}
    title="Reset Map to Default View"
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
  >
    Reset
  </button>
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

  

                {/* room zones */}
                <rect 
                  x="20" y="20" width="150" height="150" 
                  fill={darkMode ? "#1a2833" : "#e6f2ff"} 
                  stroke={darkMode ? "#4a90e2" : "#005cbf"} 
                  strokeDasharray="6" 
                  strokeWidth="1.5"
                  onMouseEnter={(e) => {
                    setTooltip({
                      visible: true,
                      x: e.clientX,
                      y: e.clientY,
                      text: "Asset Area"
                    });
                  }}
                  onMouseLeave={() => setTooltip({ visible: false, x: 0, y: 0, text: '' })}
                  onMouseMove={(e) => {
                    setTooltip(prev => ({
                      ...prev,
                      x: e.clientX,
                      y: e.clientY
                    }));
                  }}
                  style={{ cursor: 'pointer' }}
                />
                <text x="90" y="95" fill={darkMode ? "#64b5f6" : "#003366"} fontSize="12" textAnchor="middle">Asset Area</text>

                <rect 
                  x="200" y="20" width="200" height="200" 
                  fill={darkMode ? "#1a2b1a" : "#e8f5e9"} 
                  stroke={darkMode ? "#4caf50" : "#2e7d32"} 
                  strokeDasharray="6" 
                  strokeWidth="1.5"
                  onMouseEnter={(e) => {
                    setTooltip({
                      visible: true,
                      x: e.clientX,
                      y: e.clientY,
                      text: "Storage Area 1"
                    });
                  }}
                  onMouseLeave={() => setTooltip({ visible: false, x: 0, y: 0, text: '' })}
                  onMouseMove={(e) => {
                    setTooltip(prev => ({
                      ...prev,
                      x: e.clientX,
                      y: e.clientY
                    }));
                  }}
                  style={{ cursor: 'pointer' }}
                />
                <text x="295" y="120" fill={darkMode ? "#81c784" : "#1b5e20"} fontSize="12" textAnchor="middle">Storage Area 1</text>

                <rect 
                  x="500" y="60" width="200" height="200" 
                  fill={darkMode ? "#1a2b1a" : "#e8f5e9"} 
                  stroke={darkMode ? "#4caf50" : "#2e7d32"} 
                  strokeDasharray="6" 
                  strokeWidth="1.5"
                  onMouseEnter={(e) => {
                    setTooltip({
                      visible: true,
                      x: e.clientX,
                      y: e.clientY,
                      text: "Storage Area 2"
                    });
                  }}
                  onMouseLeave={() => setTooltip({ visible: false, x: 0, y: 0, text: '' })}
                  onMouseMove={(e) => {
                    setTooltip(prev => ({
                      ...prev,
                      x: e.clientX,
                      y: e.clientY
                    }));
                  }}
                  style={{ cursor: 'pointer' }}
                />
                <text x="595" y="165" fill={darkMode ? "#81c784" : "#1b5e20"} fontSize="12" textAnchor="middle">Storage Area 2</text>

                <rect 
                  x="650" y="280" width="120" height="120" 
                  fill={darkMode ? "#2b2416" : "#fff8e1"} 
                  stroke={darkMode ? "#ffc107" : "#f9a825"} 
                  strokeDasharray="6" 
                  strokeWidth="1.5"
                  onMouseEnter={(e) => {
                    setTooltip({
                      visible: true,
                      x: e.clientX,
                      y: e.clientY,
                      text: "Service Area"
                    });
                  }}
                  onMouseLeave={() => setTooltip({ visible: false, x: 0, y: 0, text: '' })}
                  onMouseMove={(e) => {
                    setTooltip(prev => ({
                      ...prev,
                      x: e.clientX,
                      y: e.clientY
                    }));
                  }}
                  style={{ cursor: 'pointer' }}
                />
                <text x="710" y="345" fill={darkMode ? "#ffb74d" : "#ef6c00"} fontSize="12" textAnchor="middle">Service Area</text>

                <rect 
                  x="140" y="330" width="220" height="120" 
                  fill={darkMode ? "#2b1a2b" : "#f3e5f5"} 
                  stroke={darkMode ? "#ba68c8" : "#8e24aa"} 
                  strokeDasharray="6" 
                  strokeWidth="1.5"
                  onMouseEnter={(e) => {
                    setTooltip({
                      visible: true,
                      x: e.clientX,
                      y: e.clientY,
                      text: "Receiving Dock"
                    });
                  }}
                  onMouseLeave={() => setTooltip({ visible: false, x: 0, y: 0, text: '' })}
                  onMouseMove={(e) => {
                    setTooltip(prev => ({
                      ...prev,
                      x: e.clientX,
                      y: e.clientY
                    }));
                  }}
                  style={{ cursor: 'pointer' }}
                />
                <text x="240" y="400" fill={darkMode ? "#ce93d8" : "#6a1b9a"} fontSize="12" textAnchor="middle">Receiving Dock</text>

                <rect 
                  x="380" y="330" width="220" height="120" 
                  fill={darkMode ? "#2b1a2b" : "#f3e5f5"} 
                  stroke={darkMode ? "#ba68c8" : "#8e24aa"} 
                  strokeDasharray="6" 
                  strokeWidth="1.5"
                  onMouseEnter={(e) => {
                    setTooltip({
                      visible: true,
                      x: e.clientX,
                      y: e.clientY,
                      text: "Shipping Dock"
                    });
                  }}
                  onMouseLeave={() => setTooltip({ visible: false, x: 0, y: 0, text: '' })}
                  onMouseMove={(e) => {
                    setTooltip(prev => ({
                      ...prev,
                      x: e.clientX,
                      y: e.clientY
                    }));
                  }}
                  style={{ cursor: 'pointer' }}
                />
                <text x="480" y="400" fill={darkMode ? "#ce93d8" : "#6a1b9a"} fontSize="12" textAnchor="middle">Shipping Dock</text>

                <rect 
                  x="20" y="200" width="90" height="100" 
                  fill={darkMode ? "#2b1a21" : "#fce4ec"} 
                  stroke={darkMode ? "#e91e63" : "#ad1457"} 
                  strokeDasharray="6" 
                  strokeWidth="1.5"
                  onMouseEnter={(e) => {
                    setTooltip({
                      visible: true,
                      x: e.clientX,
                      y: e.clientY,
                      text: "Office"
                    });
                  }}
                  onMouseLeave={() => setTooltip({ visible: false, x: 0, y: 0, text: '' })}
                  onMouseMove={(e) => {
                    setTooltip(prev => ({
                      ...prev,
                      x: e.clientX,
                      y: e.clientY
                    }));
                  }}
                  style={{ cursor: 'pointer' }}
                />
                <text x="60" y="260" fill={darkMode ? "#f48fb1" : "#880e4f"} fontSize="12" textAnchor="middle">Office</text>

                <rect 
                  x="20" y="330" width="90" height="140" 
                  fill={darkMode ? "#1a2b2b" : "#e0f7fa"} 
                  stroke={darkMode ? "#26c6da" : "#00838f"} 
                  strokeDasharray="6" 
                  strokeWidth="1.5"
                  onMouseEnter={(e) => {
                    setTooltip({
                      visible: true,
                      x: e.clientX,
                      y: e.clientY,
                      text: "Canteen"
                    });
                  }}
                  onMouseLeave={() => setTooltip({ visible: false, x: 0, y: 0, text: '' })}
                  onMouseMove={(e) => {
                    setTooltip(prev => ({
                      ...prev,
                      x: e.clientX,
                      y: e.clientY
                    }));
                  }}
                  style={{ cursor: 'pointer' }}
                />
                <text x="60" y="410" fill={darkMode ? "#4dd0e1" : "#006064"} fontSize="12" textAnchor="middle">Canteen</text>

                <g>{generateHeatmapCircles()}</g>
              </svg>
            </div>

                 
              {/* Legends */}
              {heatmapParameter === 'time' && (
  <div style={legendContainerStyle}>
    {getLegendColors(darkMode).map((item, index) => (
      <div 
        key={index}
        title={`Click to highlight areas with ${item.label.toLowerCase()} time spent`}
        style={{
          ...legendItemStyle,
          opacity: selectedColorFilter === null || selectedColorFilter === item.color ? 1 : 0.5,
        }}
        onClick={() => handleLegendClick(item.color)}
      >
        <div style={{
          width: isMobile ? 10 : 14,
          height: isMobile ? 10 : 14,
          borderRadius: '50%',
          backgroundColor: item.color,
        }}></div>
        <span>{item.label} Time </span>
      </div>
    ))}
  </div>
)}

{heatmapParameter === 'count' && (
  <div style={legendContainerStyle}>
    {getLegendColors(darkMode).map((item, index) => (
      <div 
        key={index}
        title={`Click to highlight areas with ${item.label.toLowerCase()} assets`}
        style={{
          ...legendItemStyle,
          opacity: selectedColorFilter === null || selectedColorFilter === item.color ? 1 : 0.5,
        }}
        onClick={() => handleLegendClick(item.color)}
      >
        <div style={{
          width: isMobile ? 16 : 20,
          height: isMobile ? 16 : 20,
          backgroundColor: item.color,
          clipPath: 'polygon(50% 0%, 95% 38%, 79% 95%, 21% 95%, 5% 38%)',
          border: (item.color === '#2c3e50' || item.color === '#B2BABB') ? `2px solid ${darkMode ? '#fff' : '#222'}` : 'none',
        }}></div>
        <span>{item.label} Assets </span>
      </div>
    ))}
  </div>
)}

{heatmapParameter === 'power' && (
  <div style={legendContainerStyle}>
    {getLegendColors(darkMode).map((item, index) => (
      <div 
        key={index}
        title={`Click to highlight areas with ${item.label.toLowerCase()} Kwh power usage`}
        style={{
          ...legendItemStyle,
          opacity: selectedColorFilter === null || selectedColorFilter === item.color ? 1 : 0.5,
        }}
        onClick={() => handleLegendClick(item.color)}
      >
        <div style={{
          width: isMobile ? 16 : 20, 
          height: isMobile ? 16 : 20, 
          backgroundColor: item.color,
          clipPath: 'polygon(50% 0%, 95% 38%, 79% 95%, 21% 95%, 5% 38%)',
          border: (item.color === '#2c3e50' || item.color === '#B2BABB') ? `2px solid ${darkMode ? '#fff' : '#222'}` : 'none'
        }}></div>
        <span>{item.label} Kwh</span>
      </div>
    ))}
  </div>
)}

{heatmapParameter === 'visits' && (
  <div style={legendContainerStyle}>
    {getLegendColors(darkMode).map((item, index) => (
      <div 
        key={index}
        title={`Click to highlight areas with ${item.label.toLowerCase()} visits`}
        style={{
          ...legendItemStyle,
          opacity: selectedColorFilter === null || selectedColorFilter === item.color ? 1 : 0.5,
        }}
        onClick={() => handleLegendClick(item.color)}
      >
        <div style={{
          width: isMobile ? 10 : 14, 
          height: isMobile ? 10 : 14, 
          backgroundColor: item.color,
          border: (item.color === '#2c3e50' || item.color === '#B2BABB') ? `2px solid ${darkMode ? '#fff' : '#222'}` : 'none'
        }}></div>
        <span>{item.label} Visits</span>
      </div>
    ))}
  </div>
)}

              <div style={{ 
                textAlign: 'center', 
                fontWeight: 900, 
                fontSize: isMobile ? 12 : 15, 
                color: theme.textTertiary, 
                marginTop: 6, 
                textTransform: 'uppercase'
              }}>
                {getHeatmapHeading()} ({whichZone})
              </div>

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
                    fontSize: isMobile ? 11 : 13,
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
 <div
   className={darkMode ? 'mid-panel dark-scroll' : 'mid-panel light-scroll'}
  style={{
    flexBasis: isFullScreen ? '0%' : (isMobile ? '100%' : '25%'),
    padding: isFullScreen ? 0 : (isMobile ? 8 : 16),
    backgroundColor: darkMode ? '#1a1a1a' : '#ffffff', // ✅ Dark mode support
    color: darkMode ? '#f0f0f0' : '#000000',  
    boxShadow: 'none', 
            
    overflowY: 'auto',
    display: isFullScreen ? 'none' : 'block',
  }}
>

  {/* Box 1: Time Range + Heatmap Filter */}
  <div style={{
    backgroundColor: darkMode ? '#2a2a2a' : '#ffffff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 20,
    border: `1px solid ${darkMode ? '#555' : '#ccc'}`,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
  }}>
    {/* Time Range */}
    <div style={{ marginBottom: 16 }}>
      <label style={{
        fontWeight: 700,
        color: theme.textPrimary,
        display: 'flex',
        alignItems: 'center',
        marginBottom: 8,
        fontSize: 14
      }}>
        <FaClock style={{ marginRight: 6 }} /> Time Range
      </label>
      <select
        value={timeRange}
        onChange={(e) => setTimeRange(e.target.value)}
        style={{
          width: '100%',
          padding: 10,
          borderRadius: 16,
          border: `1px solid ${theme.border}`,
          backgroundColor: darkMode ? '#4a4a4a' : '#ffffff',
          color: theme.textPrimary,
          fontWeight: 500,
          fontSize: 14
        }}
      >
        <option>1 Hour</option>
        <option>4 Hours</option>
        <option>24 Hours</option>
      </select>
    </div>

    {/* Heatmap Filter */}
    <div>
      <label style={{
        fontWeight: 700,
        color: theme.textPrimary,
        display: 'flex',
        alignItems: 'center',
        marginBottom: 8,
        fontSize: 14
      }}>
        <FaFire style={{ marginRight: 6 }} /> Heatmap Filter
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
          fontSize: 14
        }}
      >
        <option value="time">Dwell Time</option>
        <option value="count">Peak Occupancy</option>
        <option value="power">Power Consumption</option>
        <option value="visits">Visit Frequency</option>
      </select>
    </div>
  </div>

  {/* Box 2: Select Zone + Floor + Intensity */}
  <div style={{
    backgroundColor: darkMode ? '#2a2a2a' : '#ffffff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 20,
    border: `1px solid ${darkMode ? '#555' : '#ccc'}`,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
  }}>
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontWeight: 700, color: theme.textPrimary, marginBottom: 8, display: 'block' }}>Select Zone</label>
      <select value={whichZone} onChange={(e) => setWhichZone(e.target.value)} style={{
        width: '100%',
        padding: '10px 12px',
        borderRadius: 16,
        border: `1px solid ${theme.border}`,
        backgroundColor: darkMode ? '#4a4a4a' : '#ffffff',
        color: theme.textPrimary,
        fontWeight: 500,
        fontSize: 14
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

    <div style={{ marginBottom: 16 }}>
      <label style={{ fontWeight: 700, color: theme.textPrimary, marginBottom: 8, display: 'block' }}>Select Floor</label>
      <select value={whichZone} onChange={(e) => setWhichZone(e.target.value)} style={{
        width: '100%',
        padding: '10px 12px',
        borderRadius: 16,
        border: `1px solid ${theme.border}`,
        backgroundColor: darkMode ? '#4a4a4a' : '#ffffff',
        color: theme.textPrimary,
        fontWeight: 500,
        fontSize: 14
      }}>
        <option>Floor 1</option>
        <option>Floor 2</option>
        <option>Floor 3</option>
      </select>
    </div>

   {/* Intensity Slider */}
<div>
  <label
    style={{
      fontWeight: 700,
      color: theme.textPrimary,
      display: 'block',
      marginBottom: 6,
    }}
  >
    Adjust Intensity
  </label>
  
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
      background: darkMode
        ? 'linear-gradient(to right, #64DA82 0%, #48BF91 25%, #00D4FF 50%, #6C5DD3 75%, #FF4D6D 100%)'
        : 'linear-gradient(to right, #BFFF00 0%, #93DD45 25%, #FDE34D 50%, #F4A03F 75%, #e74c3c 100%)',
    }}
  />

  <div
    style={{
      textAlign: 'right',
      fontSize: 13,
      fontWeight: 700,
      marginTop: 6,
      color: theme.textSecondary,
    }}
  >
    Intensity: {intensity}
  </div>
</div>
</div>

  {/* Box 3: Asset Type + Heatmap Details */}
  <div style={{
    backgroundColor: darkMode ? '#2a2a2a' : '#ffffff',
    padding: 16,
    borderRadius: 20,
    border: `1px solid ${darkMode ? '#555' : '#ccc'}`,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
  }}>
    {/* Asset Type */}
    <label style={{
      fontWeight: 700,
      color: theme.textPrimary,
      display: 'flex',
      alignItems: 'center',
      marginBottom: 8
    }}>
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
        fontWeight: 500,
        fontSize: 14
      }}
    >
      <option>Forklifts</option>
      <option>Cranes</option>
      <option>Carts</option>
      <option>Operators/Workers</option>
      <option>All Assets</option>
    </select>

    {/* Heatmap Details */}
    <div style={{ marginTop: 16 }}>
      <h3 style={{
        fontSize: 14,
        fontWeight: 700,
        color: theme.textPrimary,
        display: 'flex',
        alignItems: 'center'
      }}>
        <AiOutlineHeatMap style={{ marginRight: 6 }} />
        Heatmap Details
      </h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {stableAssetData.map(({ id, value }, index) => (
          <li key={index} style={{
            marginBottom: 6,
            padding: '10px 14px',
            borderRadius: 14,
            backgroundColor: darkMode ? '#4a4a4a' : '#F1F3F4',
            fontSize: 14,
            fontWeight: 600,
            color: theme.textPrimary,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span>{id}</span>
            <span>
              {heatmapParameter === 'time' && `${value} seconds`}
              {heatmapParameter === 'count' && `${value} assets`}
              {heatmapParameter === 'power' && `${value} Kwh`}
              {heatmapParameter === 'visits' && `${value} visits`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  </div>
</div>
            </div>
          </div>
    
  );
};

export default WarehouseHeatmap;
