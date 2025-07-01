import React, { useState, useEffect } from 'react';
import { GiHamburgerMenu } from 'react-icons/gi';
import { MdAccessTime } from 'react-icons/md';
import { FaRobot } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const heatmapData = [
  // ASSET AREA: Green (light crowd)
  { x: 2.2, y: 1.8, count: 3 },
  { x: 2.6, y: 1.7, count: 4 },
  { x: 1.9, y: 2.4, count: 2 },
  { x: 2.1, y: 2.1, count: 3 },
  { x: 2.5, y: 2.2, count: 2 },
  { x: 1.8, y: 2.3, count: 1 },
  { x: 2.4, y: 2.5, count: 4 },

  // ASSET AREA: Yellow (medium crowd)
  { x: 3.0, y: 2.2, count: 12 },
  { x: 3.2, y: 2.3, count: 14 },
  { x: 3.3, y: 2.4, count: 11 },
  { x: 3.1, y: 2.6, count: 13 },
  { x: 3.5, y: 2.5, count: 10 },
  { x: 3.4, y: 2.7, count: 11 },

  // ASSET AREA: Red (heavy crowd)
  { x: 4.0, y: 2.3, count: 30 },
  { x: 4.1, y: 2.4, count: 32 },
  { x: 4.2, y: 2.5, count: 34 },
  { x: 4.0, y: 2.7, count: 35 },
  { x: 4.3, y: 2.6, count: 33 },
  { x: 4.1, y: 2.8, count: 31 },
  { x: 4.4, y: 2.9, count: 36 },
  { x: 4.5, y: 2.4, count: 38 },
  { x: 4.6, y: 2.5, count: 37 },
  { x: 4.7, y: 2.6, count: 36 },
  { x: 4.8, y: 2.5, count: 35 },

  // Yellow-Red mixed boundary
  { x: 3.8, y: 2.4, count: 18 },
  { x: 3.9, y: 2.3, count: 20 },
  { x: 4.0, y: 2.2, count: 22 },
  { x: 4.1, y: 2.1, count: 19 },

  // Green-Yellow boundary
  { x: 2.9, y: 2.7, count: 7 },
  { x: 3.0, y: 2.9, count: 8 },
  { x: 3.1, y: 3.0, count: 9 },
  { x: 2.8, y: 2.8, count: 6 },
  { x: 2.7, y: 2.9, count: 4 },
  { x: 2.6, y: 3.0, count: 3 },

  // STORAGE AREA
  { x: 18.0, y: 7.0, count: 23 },
  { x: 16.2, y: 7.1, count: 34 },
  { x: 15.8, y: 7.2, count: 32 },
  { x: 16.4, y: 7.3, count: 33 },
  { x: 16.2, y: 7.1, count: 34 },
  { x: 15.2, y: 7.2, count: 32 },
  { x: 16.1, y: 7.3, count: 33 },
  { x: 16.4, y: 7.1, count: 32 },
  { x: 15.9, y: 7.4, count: 31 },
  { x: 16.3, y: 7.4, count: 34 },
  { x: 17.0, y: 8.0, count: 12 },
  { x: 17.2, y: 8.1, count: 14 },
  { x: 17.3, y: 8.2, count: 11 },
  { x: 17.1, y: 8.4, count: 13 },
  { x: 17.5, y: 8.3, count: 10 },
  { x: 17.4, y: 8.5, count: 11 },
  { x: 18.0, y: 9.0, count: 30 },
  { x: 18.1, y: 9.1, count: 32 },
  { x: 18.2, y: 9.2, count: 34 },
  { x: 18.0, y: 9.4, count: 35 },
  { x: 18.3, y: 9.3, count: 33 },
  { x: 18.1, y: 9.5, count: 31 },
  { x: 18.4, y: 9.6, count: 36 },
  { x: 18.5, y: 9.1, count: 38 },
  { x: 18.6, y: 9.2, count: 37 },
  { x: 18.7, y: 9.3, count: 36 },
  { x: 18.8, y: 9.2, count: 35 },
  { x: 17.8, y: 9.2, count: 18 },
  { x: 17.9, y: 9.1, count: 20 },
  { x: 18.0, y: 9.0, count: 22 },
  { x: 18.1, y: 8.9, count: 19 },
  { x: 18.9, y: 8.4, count: 7 },
  { x: 19.0, y: 8.6, count: 8 },
  { x: 18.1, y: 8.7, count: 9 },
  { x: 16.8, y: 8.5, count: 6 },
  { x: 17.7, y: 8.6, count: 4 },
  { x: 17.6, y: 8.7, count: 3 },

  // SERVICE AREA
  { x: 2.0, y: 7.5, count: 3 },
  { x: 2.2, y: 7.6, count: 4 },
  { x: 1.8, y: 7.7, count: 2 },
  { x: 2.1, y: 7.8, count: 3 },
  { x: 2.3, y: 7.6, count: 2 },
  { x: 1.9, y: 7.9, count: 1 },
  { x: 2.4, y: 7.9, count: 4 },
  { x: 3.0, y: 8.2, count: 12 },
  { x: 3.2, y: 8.3, count: 14 },
  { x: 3.3, y: 8.4, count: 25 },
  { x: 3.1, y: 8.6, count: 13 },
  { x: 3.5, y: 8.5, count: 10 },
  { x: 3.4, y: 8.7, count: 11 },
  { x: 4.0, y: 9.0, count: 30 },
  { x: 4.1, y: 9.1, count: 32 },
  { x: 4.2, y: 9.2, count: 34 },
  { x: 4.0, y: 9.4, count: 35 },
  { x: 4.3, y: 9.3, count: 33 },
  { x: 4.1, y: 9.5, count: 31 },
  { x: 4.4, y: 9.6, count: 36 },
  { x: 4.5, y: 9.1, count: 38 },
  { x: 4.6, y: 9.2, count: 37 },
  { x: 4.7, y: 9.3, count: 36 },
  { x: 4.8, y: 9.2, count: 35 },
  { x: 3.8, y: 9.2, count: 18 },
  { x: 3.9, y: 9.1, count: 20 },
  { x: 4.0, y: 9.0, count: 22 },
  { x: 4.1, y: 8.9, count: 19 },
  { x: 2.9, y: 8.6, count: 7 },
  { x: 3.0, y: 8.8, count: 8 },
  { x: 3.1, y: 8.9, count: 9 },
  { x: 2.8, y: 8.7, count: 6 },
  { x: 2.7, y: 8.8, count: 4 },
  { x: 2.6, y: 8.9, count: 3 },

 // Clustered: from Asset (~2.5, 2.5) → Storage (~16.5, 7.5)

{ x: 6.6, y: 4.5, count: 14 },
{ x: 6.1, y: 4.6, count: 13 },
{ x: 7.0, y: 4.9, count: 15 },
{ x: 7.2, y: 5, count: 16 },

{ x: 10.8, y: 5.5, count: 18 },
{ x: 9.1, y: 5.4, count: 19 },
{ x: 10.2, y: 5.6, count: 17 },
{ x: 9.1, y: 5.8, count: 18 },

{ x: 12.0, y: 6.4, count: 22 },
{ x: 13.8, y: 6.5, count: 21 },
{ x: 12.0, y: 6.6, count: 35 },
{ x: 13.1, y: 6.9, count: 36 },


{ x: 18.6, y: 8, count: 38 },
{ x: 13.6, y: 7, count: 78 },
{ x: 13.9, y: 7.3, count: 78 },
{ x: 13.7, y: 7.3, count: 38 },
];

const assetToStorageRoute = [
  { x: 3.0, y: 3.0 },
  { x: 6.0, y: 4.5 },
  { x: 9.0, y: 5.5 },
  { x: 12.0, y: 6.5 },
  { x: 16.5, y: 7.5 },
];

const assetToServiceRoute = [
  { x: 2.7, y: 3.2 },
  { x: 2.7, y: 4.2 },
  { x: 2.6, y: 5.2 },
  { x: 2.5, y: 6.2 },
  { x: 2.5, y: 8.5 },
];






const getColorAndTooltip = (count) => {
  if (count > 35) return { color: 'red', tooltip: `Count: ${count}, High Crowd` };
  if (count > 25) return { color: 'orange', tooltip: `Count: ${count}, Moderate to High Crowd` };
  if (count > 15) return { color: 'yellow', tooltip: `Count: ${count}, Moderate Crowd` };
  if (count > 1) return { color: 'limegreen', tooltip: `Count: ${count}, Low Crowd` };
  return { color: 'green', tooltip: `Count: ${count}, Negligible Crowd` };
};

const HeatMap = () => {
  const [selectedTime, setSelectedTime] = useState('1 Hour');
  const [selectedAsset, setSelectedAsset] = useState('Forklifts');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [panelOpen, setPanelOpen] = useState(window.innerWidth > 768);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeToggle, setActiveToggle] = useState('Heat Map');
  const [activeButton, setActiveButton] = useState('1 Hour');
  const [activeAsset, setActiveAsset] = useState('Forklifts');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setPanelOpen(!mobile);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cellSize = 50;
  const getCurrentIds = () => ['01', '02', '03'];

  const buttonStyles = (label, bg, color, active) => ({
    backgroundColor: label === active ? (isDarkMode ? '#000' : '#001f3f') : bg,
    color: label === active ? (isDarkMode ? '#39FF14' : '#fff') : color,
    padding: '10px 18px',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 'bold',
    fontFamily: 'Times New Roman',
    fontSize: '14px',
    cursor: 'pointer',
    boxShadow: label === active && isDarkMode ? '0 0 6px #39FF14' : 'none'
  });

  const handleButtonClick = (label) => {
    setActiveButton(label);
    setSelectedTime(label);
  };

  const handleAssetClick = (label) => {
    setActiveAsset(label);
    setSelectedAsset(label);
  };

  const handleIdClick = (id) => {
    setExpandedId(id === expandedId ? null : id);
  };

  return (
    <div
      className={isDarkMode ? 'dark-mode' : ''}
      style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: isDarkMode ? 'black' : 'black'
      }}
    >
      {/* Left Panel */}
      <div style={{
        flex: panelOpen ? 2 : 1,
        padding: isMobile ? '10px 15px' : '30px',
        backgroundColor: isDarkMode ? '#0a0a0a' : '#f8fafc',
        color: isDarkMode ? '#fff' : '#000',
        display: 'flex',
        flexDirection: 'column',
        height: isMobile ? 'auto' : '100%',
      }}>
        {/* Title */}
        <div style={{
          textAlign: 'center',
          fontSize: '22px',
          fontWeight: 'bold',
          fontFamily: ' times new roman',
          color: isDarkMode ? '#39FF14' : '#001f3f',
          marginBottom: '10px'
        }}>
          Real-Time Tracker | Warehouse - Heatmap
        </div>

        {/* Map & Legend Stack */}
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          {/* SVG Container (Map Holder) */}
          <div style={{
            backgroundColor: isDarkMode ? '#111' : '#fff',
            border: '1px solid #000',
            borderRadius: '5px',
            position: 'relative',
            width: `calc(100% - 5px)`,
            height: isMobile ? 'calc(48vh - 20px)' : 'calc(75vh - 20px)',
            overflow: 'hidden',
            marginTop: 30,
            marginBottom: 0,
          }}>
            <style>{`
              @keyframes pulse {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.4); opacity: 0.6; }
                100% { transform: scale(1); opacity: 1; }
              }
            `}</style>

            <svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${20 * cellSize} ${12 * cellSize}`}
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Grid */}
              {[...Array(12)].map((_, y) =>
                [...Array(20)].map((_, x) => (
                  <rect
                    key={`${x}-${y}`}
                    x={x * cellSize}
                    y={y * cellSize}
                    width={cellSize}
                    height={cellSize}
                    fill={isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(200,200,200,0.1)'}
                    stroke={isDarkMode ? '#555' : '#ccc'}
                  />
                ))
              )}

              {/* Labels + Area blocks */}
              <text x={cellSize * 1} y={cellSize * 0.8} fill={isDarkMode ? '#39FF14' : '#001f3f'} fontSize="16" fontWeight="bold">Asset Area</text>
              <text x={cellSize * 1.0} y={cellSize * 6.9} fill={isDarkMode ? '#39FF14' : '#001f3f'} fontSize="16" fontWeight="bold">Service Area</text>
              <text x={cellSize * 15} y={cellSize * 6.9} fill={isDarkMode ? '#39FF14' : '#001f3f'} fontSize="16" fontWeight="bold">Storage Area</text>

              <rect x={1 * cellSize} y={1 * cellSize} width={5 * cellSize} height={3 * cellSize} fill="limegreen" opacity="0.2" />
              <rect x={1 * cellSize} y={7 * cellSize} width={7 * cellSize} height={5 * cellSize} fill="skyblue" opacity="0.2" />
              <rect x={15 * cellSize} y={7 * cellSize} width={5 * cellSize} height={4 * cellSize} fill="orange" opacity="0.2" />

              {/* 🚚 Asset to Storage Route Line */}
<polyline
  points={assetToStorageRoute.map(p => `${p.x * cellSize + cellSize / 2},${p.y * cellSize + cellSize / 2}`).join(' ')}
  fill="none"
  stroke=" grey"
  strokeWidth="2"
  strokeDasharray="6 4"
  strokeLinecap="round"
  opacity="0.2"
/>



              {/* Heatmap Dots */}
              {heatmapData.map((point, i) => {
                const { color, tooltip } = getColorAndTooltip(point.count);
                const cx = point.x * cellSize + cellSize / 2;
                const cy = point.y * cellSize + cellSize / 2;
                const isRed = color === 'red';
                return (
                  <rect
                    key={i}
                    x={cx - 2.5}
                    y={cy - 2.5}
                    width={13}
                    height={13}
                    fill={color}
                    opacity={0.8}
                    filter="url(#glow)"
                    style={{
                      transition: 'fill 0.6s ease, transform 0.4s ease',
                      animation: isRed ? 'pulse 2s infinite ease-in-out' : 'none',
                      transformOrigin: `${cx}px ${cy}px`
                    }}
                  >
                    <title>{tooltip}</title>
                  </rect>
                );
              })}
            </svg>
          </div>

          {/* ✅ Legend placed below the map holder */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            marginTop: '12px',
            padding: '10px 15px',
            backgroundColor: isDarkMode ? '#111' : '#f9fafb',
            width: '100%'
          }}>
            {[
              { color: 'red', label: 'High Crowd (>35)' },
              { color: 'orange', label: 'Mod-High (25–35)' },
              { color: 'yellow', label: 'Moderate (15–25)' },
              { color: 'limegreen', label: 'Low (2–15)' },
              { color: 'green', label: 'Negligible (0–1)' },
            ].map((legend, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '13px',
                  height: '13px',
                  backgroundColor: legend.color,
                 
                }} />
                <span style={{ fontSize: '12px', color: isDarkMode ? '#fff' : '#000', fontFamily: 'Times New Roman' }}>
                  {legend.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Right Panel */}
      {panelOpen && (
          <div
            style={{
              width: isMobile ? '95%' : '420px',
              maxWidth: '100%',
              margin: isMobile ? '0 auto' : '0',
              height: isMobile ? 'auto' : '100vh',
              backgroundColor: isDarkMode ? '#0a0a0a' : '#ffffff',
              boxShadow: '0 0 12px rgba(0,0,0,0.08)',
              padding: isMobile ? '20px' : '30px 25px',
              display: 'flex',
              flexDirection: 'column',
              gap: '25px',
              overflowY: isMobile ? 'scroll' : 'auto',
              color: isDarkMode ? '#ffffff' : '#1e293b'
            }}
            className="scroll-panel"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
              <div
                onClick={() => setPanelOpen(false)}
                style={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '50%',
                  backgroundColor: isDarkMode ? '#1a1a1a' : '#f1f5f9',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.06)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
              >
                <GiHamburgerMenu size={20} color={isDarkMode ? '#39FF14' : '#1e293b'} />
              </div>
              <Link to="/dashboard" style={{ flex: 1 }}>
  <button
    className={activeToggle === 'Live Tracking' ? 'active' : ''}
    onClick={() => setActiveToggle('Live Tracking')}
    style={{
      backgroundColor: activeToggle === 'Live Tracking' ? (isDarkMode ? '#000' : '#001f3f') : 'transparent',
      color: activeToggle === 'Live Tracking' ? (isDarkMode ? '#39FF14' : '#ffffff') : (isDarkMode ? '#ffffff' : '#334155'),
      fontWeight: activeToggle === 'Live Tracking' ? 'bold' : 'normal',
      border: activeToggle === 'Live Tracking' ? (isDarkMode ? '2px solid #39FF14' : 'none') : 'none',
      borderRadius: '12px',
      padding: '10px 0',
      fontFamily: 'Times New Roman',
      fontSize: '16px',
      cursor: 'pointer',
      boxShadow: activeToggle === 'Live Tracking' && isDarkMode ? '0 0 8px #39FF14' : 'none',
      width: '100%'
    }}
  >
    Live Tracking
  </button>
</Link>

<Link to="/heatmap" style={{ flex: 1 }}>
  <button
    className={activeToggle === 'Heat Map' ? 'active' : ''}
    onClick={() => setActiveToggle('Heat Map')}
    style={{
      backgroundColor: activeToggle === 'Heat Map' ? (isDarkMode ? '#000' : '#001f3f') : 'transparent',
      color: activeToggle === 'Heat Map' ? (isDarkMode ? '#39FF14' : '#ffffff') : (isDarkMode ? '#ffffff' : '#334155'),
      fontWeight: activeToggle === 'Heat Map' ? 'bold' : 'normal',
      border: activeToggle === 'Heat Map' ? (isDarkMode ? '2px solid #39FF14' : 'none') : 'none',
      borderRadius: '12px',
      padding: '10px 0',
      fontFamily: 'Times New Roman',
      fontSize: '16px',
      cursor: 'pointer',
      boxShadow: activeToggle === 'Heat Map' && isDarkMode ? '0 0 8px #39FF14' : 'none',
      width: '100%'
    }}
  >
    Heat Map
  </button>
</Link>


            </div>

            <div style={{ backgroundColor: isDarkMode ? '#1a1a1a' : '#f1f5f9', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <MdAccessTime size={18} color={isDarkMode ? '#39FF14' : '#001f3f'} />
                <span style={{ fontFamily: 'Times New Roman', fontSize: '18px', color: isDarkMode ? '#39FF14' : '#1e293b' }}>Time Range</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {['1 Hour', '1 Day', '1 Week'].map(label => (
                  <button
                    key={label}
                    style={buttonStyles(label, isDarkMode ? '#111' : '#e2e8f0', isDarkMode ? '#ffffff' : '#1e293b', activeButton)}
                    onClick={() => handleButtonClick(label)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: isDarkMode ? '#1a1a1a' : '#f1f5f9', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <FaRobot size={18} color={isDarkMode ? '#39FF14' : '#001f3f'} />
                <span style={{ fontFamily: 'Times New Roman', fontSize: '18px', color: isDarkMode ? '#39FF14' : '#1e293b' }}>Asset Type</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' }}>
                {['Forklifts', 'Operators', 'Cranes'].map(label => (
                  <button
                    key={label}
                    style={buttonStyles(label, isDarkMode ? '#111' : '#e2e8f0', isDarkMode ? '#ffffff' : '#1e293b', activeAsset)}
                    onClick={() => handleAssetClick(label)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div style={{ height: '2px', backgroundColor: '#cbd5e1', marginBottom: '10px' }}></div>
              {getCurrentIds().map(id => (
                <div key={id} style={{ marginBottom: '10px' }}>
                  <div
                    style={{
                      padding: '10px',
                      fontSize: '16px',
                      fontFamily: 'Times New Roman',
                      color: expandedId === id ? (isDarkMode ? '#39FF14' : '#001f3f') : (isDarkMode ? '#ffffff' : '#1e293b'),
                      fontWeight: expandedId === id ? 'bold' : 'normal',
                      cursor: 'pointer',
                      borderRadius: '10px',
                      backgroundColor: expandedId === id ? (isDarkMode ? '#002800' : '#e0f2fe') : 'transparent',
                      transition: 'all 0.3s ease',
                      boxShadow: expandedId === id && isDarkMode ? '0 0 10px #39FF14' : 'none'
                    }}
                    onClick={() => handleIdClick(id)}
                  >
                    {activeAsset === 'Forklifts' ? `ForkliftID : #${id}` : activeAsset === 'Cranes' ? `CraneID : #${id}` : `OperatorID : #${id}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hamburger Reopen */}
        {!panelOpen && (
          <div
            onClick={() => setPanelOpen(true)}
            style={{
              position: 'absolute',
              top: '30px',
              right: '20px',
              width: '45px',
              height: '45px',
              borderRadius: '50%',
              backgroundColor: isDarkMode ? '#1a1a1a' : '#f1f5f9',
              boxShadow: '0 4px 8px rgba(0,0,0,0.08)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              zIndex: 20
            }}
          >
            <GiHamburgerMenu size={20} color={isDarkMode ? '#39FF14' : '#1e293b'} />
          </div>
        )}

 

        
    </div>
  );
};

export default HeatMap;

