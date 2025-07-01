import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MdAccessTime } from "react-icons/md";
import { FaRobot } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import { FaMoon, FaSun } from "react-icons/fa";
import { FaTruck, FaUserCog } from 'react-icons/fa';      // Forklift & Operator
import { GiCargoCrane } from "react-icons/gi"; 
import { LiaLuggageCartSolid } from "react-icons/lia";             



const styles = `
@keyframes blink {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.4); opacity: 0.6; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes detailFadeIn {
  0% { transform: translateY(20px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
.detail-animation {
  animation: detailFadeIn 0.5s ease-in-out forwards;
}
@keyframes slideIn {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.expand {
  max-height: 400px;
  opacity: 1;
  animation: slideIn 0.4s ease-out;
  transition: max-height 0.6s ease, opacity 0.6s ease;
}
.collapse {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transition: max-height 0.6s ease, opacity 0.6s ease;
}
.toggle-btns {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: 'black';
  border-color: '#f0f4f8
  border-radius: 35px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: all 0.4s ease;
  width: 100%;
}
.toggle-btns button {
  flex: 1;
  padding: 10px 0;
  font-size: 16px;
  font-family: 'Times New Roman';
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: transparent;
  color: black;
}
.toggle-btns button.active {
  background-color: #001f3f;
  color: BLACK;
  font-weight: bold;
  box-shadow: 0 0 8px rgba(0, 31, 63, 0.4);
  border-radius: 12px;
}


.dark-mode .toggle-btns button:not(.active) {
  background-color: #000000;
  color: #39FF14;
  border: 1px solid #39FF14;
}


/* Tooltip */
.tooltip {
  font-family: 'Times New Roman';
  font-size: 13px;
  fill: #000000;
}

/* Responsive */
@media (max-width: 768px) {
  .toggle-btns {
    flex-direction: column;
    gap: 10px;
  }
  .toggle-btns button {
    font-size: 14px;
    padding: 8px 0;
  }
  .tooltip {
    font-size: 11px;
  }
  .scroll-panel {
    position: relative;
    max-height: 55vh;
    overflow-y: auto;
    padding-bottom: 20px;
  }
}
`;

const assetIcons = {
  'Forklifts': FaTruck,
  'Cranes': GiCargoCrane,
  'Operators': FaUserCog,
  'carts' : LiaLuggageCartSolid
};



const AssetLayout = ({ activeAsset, trailPath, currentPos, showMarker, finalPathLength, isMobile, isDarkMode }) => {
  const rows = 10;
  const cols = 10;
  const cellSize = isMobile ? 30 : 50;

  const cells = [];
  for (let row = 0; row <= rows; row++) {
    for (let col = 0; col <= cols; col++) {
      cells.push(
        <rect
          key={`cell-${row}-${col}`}
          x={col * cellSize}
          y={row * cellSize}
          width={cellSize}
          height={cellSize}
          fill={isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(200,200,200,0.2)'}
          stroke={isDarkMode ? '#555' : '#aaa'}
          strokeWidth="0.8"
        />
      );
    }
  }

  const areaColors = {
    'Storage': isDarkMode ? '#39FF14' : '#007bff',
    'Asset': isDarkMode ? '#39FF14' : '#ff9800',
    'Service': isDarkMode ? '#39FF14' : '#4caf50'
  };

  const trailCircles = trailPath.map((step, index) => {
    const isLastStep = index === trailPath.length - 1 && trailPath.length === finalPathLength;
    const isFirstStep = index === 0;
    return (
      <React.Fragment key={`trail-${index}`}>
        <circle
          cx={step.x + cellSize / 2}
          cy={step.y + cellSize / 2}
          r={6}
          fill={
            isDarkMode
              ? (isLastStep ? '#39FF14' : areaColors[step.label] || '#39FF14')
              : (isLastStep ? '#6b7280' : areaColors[step.label] || '#6b7280')
          }
          opacity={0.9}
          style={{
            filter: isDarkMode ? 'drop-shadow(0 0 5px #39FF14)' : 'none'
          }}
        />
        {isFirstStep && (
          <text
            x={step.x + cellSize / 2}
            y={step.y - 10}
            textAnchor="middle"
            fontFamily="Times New Roman"
            fontSize="13"
            fill={isDarkMode ? '#39FF14' : '#333'}
          >
            Start
          </text>
        )}
        {isLastStep && (
          <text
            x={step.x + cellSize / 2}
            y={step.y - 10}
            textAnchor="middle"
            fontFamily="Times New Roman"
            fontSize="13"
            fill={isDarkMode ? '#39FF14' : '#6b7280'}
          >
            End
          </text>
        )}
      </React.Fragment>
    );
  });

  const trailLines = trailPath.slice(1).map((step, index) => {
    const prev = trailPath[index];
    return (
      <line
        key={`line-${index}`}
        x1={prev.x + cellSize / 2}
        y1={prev.y + cellSize / 2}
        x2={step.x + cellSize / 2}
        y2={step.y + cellSize / 2}
        stroke={isDarkMode ? '#39FF14' : '#6b7280'}
        strokeWidth="2"
        strokeDasharray="4"
        style={{
          filter: isDarkMode ? 'drop-shadow(0 0 3px #39FF14)' : 'none'
        }}
      />
    );
  });

  const assetColors = {
    'Forklifts': isDarkMode ? 'yellow' : 'yellow',
    'Cranes': isDarkMode ? '#FFA500' : 'orange',
    'Operators': isDarkMode ? '#00BFFF' : 'blue'
  };

  const MarkerIcon = assetIcons[activeAsset];

const marker = showMarker && currentPos && MarkerIcon && (
  <>
    <foreignObject
      x={currentPos.x + cellSize / 2 - 15}
      y={currentPos.y + cellSize / 2 - 15}
      width={30}
      height={30}
    >
      <div className="icon-jump" style={{ width: '100%', height: '100%' }}>
        <MarkerIcon
          size={isMobile ? 18 : 24}
          color={isDarkMode ? '#39FF14' : '#001f3f'}
          style={{
            filter: isDarkMode ? 'drop-shadow(0 0 4px #39FF14)' : 'none',
            width: '100%',
            height: '100%'
          }}
        />
      </div>
    </foreignObject>

    <text
      x={currentPos.x + cellSize / 2}
      y={currentPos.y + cellSize / 2 - 25}
      textAnchor="middle"
      className="tooltip"
      fill={isDarkMode ? '#fff' : '#000'}
    >
      {activeAsset} Tracking
    </text>
  </>
);

  
  return (
    <svg
      width="100%"
      height="100%"
      viewBox={isMobile 
        ? `-30 -30 ${cols * cellSize + 80} ${rows * cellSize + 100}` 
        : `-60 -25 ${cols * cellSize + 120} ${rows * cellSize + 120}`}      
      style={{ backgroundColor: isDarkMode ? '#000000' : '#ffffff' }}
    >
          {/* Highlighted Area Blocks */}
    <rect
      x={0 * cellSize}
      y={0 * cellSize}
      width={3 * cellSize}
      height={3 * cellSize}
      fill="limegreen"
      opacity="0.25"
    />
    <rect
      x={0 * cellSize}
      y={7 * cellSize}
      width={5 * cellSize}
      height={4 * cellSize}
      fill="skyblue"
      opacity="0.25"
    />
    <rect
      x={7 * cellSize}
      y={7 * cellSize}
      width={4 * cellSize}
      height={4 * cellSize}
      fill="orange"
      opacity="0.25"
    />

      {cells}
      {trailLines}
      {trailCircles}
      {marker}

      {cells}
{trailLines}
{trailCircles}
{marker}

{/* Highlighted Area Blocks */}
<rect x={0 * cellSize} y={0 * cellSize} width={3 * cellSize} height={3 * cellSize} fill="limegreen" opacity="0.25" />
<rect x={0 * cellSize} y={7 * cellSize} width={5 * cellSize} height={4 * cellSize} fill="skyblue" opacity="0.25" />
<rect x={7 * cellSize} y={7 * cellSize} width={4 * cellSize} height={4 * cellSize} fill="orange" opacity="0.25" />

{/* Office on top-right corner of 3x3 area */}
<rect x={8 * cellSize} y={0 * cellSize} width={3 * cellSize} height={2 * cellSize} fill="#555" opacity="0.3" />
<text x={10.5 * cellSize} y={0.8 * cellSize} fontSize="12" fill={isDarkMode ? "#39FF14" : "#000"} textAnchor="middle">Office</text>

{/* Racks */}
<rect x={3 * cellSize} y={10.5 * cellSize} width={cellSize} height={cellSize / 4} fill="brown" />
<rect x={2 * cellSize} y={10 * cellSize} width={cellSize} height={cellSize / 4} fill="brown" />
<rect x={1 * cellSize} y={10.5 * cellSize} width={cellSize} height={cellSize / 4} fill="brown" />
<rect x={0 * cellSize} y={10 * cellSize} width={cellSize} height={cellSize / 4} fill="brown" />
<rect x={3 * cellSize} y={7.5 * cellSize} width={cellSize} height={cellSize / 4} fill="brown" />
<rect x={2 * cellSize} y={8 * cellSize} width={cellSize} height={cellSize / 4} fill="brown" />
<rect x={1 * cellSize} y={7.5 * cellSize} width={cellSize} height={cellSize / 4} fill="brown" />
<rect x={0 * cellSize} y={8 * cellSize} width={cellSize} height={cellSize / 4} fill="brown" />
<text x={1.25 * cellSize} y={9.7 * cellSize} fontSize="10" fill={isDarkMode ? "#39FF14" : "#000"}>Racks</text>

{/* Forklifts */}
<foreignObject x={0 * cellSize + 10} y={0 * cellSize + 10} width={24} height={24}>
  <div style={{ width: '100%', height: '100%' }}>
    <LiaLuggageCartSolid size={20} color="black" />
  </div>
</foreignObject>
<foreignObject x={1 * cellSize + 10} y={0 * cellSize + 10} width={24} height={24}>
  <div style={{ width: '100%', height: '100%' }}>
    <LiaLuggageCartSolid size={20} color="black" />
  </div>
</foreignObject>
<foreignObject x={2 * cellSize + 10} y={0 * cellSize + 10} width={24} height={24}>
  <div style={{ width: '100%', height: '100%' }}>
    <LiaLuggageCartSolid size={20} color="black" />
  </div>
</foreignObject>
<foreignObject x={0 * cellSize + 10} y={2 * cellSize + 10} width={24} height={24}>
  <div style={{ width: '100%', height: '100%' }}>
    <FaTruck size={20} color="black" />
  </div>
</foreignObject>
<foreignObject x={1 * cellSize + 10} y={2 * cellSize + 10} width={24} height={24}>
  <div style={{ width: '100%', height: '100%' }}>
    <FaTruck size={20} color="black" />
  </div>
</foreignObject>
<foreignObject x={0 * cellSize + 10} y={1 * cellSize + 10} width={24} height={24}>
  <div style={{ width: '100%', height: '100%' }}>
    <FaTruck size={20} color="black" />
  </div>
</foreignObject>

{/* Cranes */}
<foreignObject x={8 * cellSize + 10} y={8 * cellSize + 10} width={24} height={24}>
  <div style={{ width: '100%', height: '100%' }}>
    <GiCargoCrane size={20} color="black" />
  </div>
</foreignObject>
<foreignObject x={8 * cellSize + 10} y={10 * cellSize + 10} width={24} height={24}>
  <div style={{ width: '100%', height: '100%' }}>
    <GiCargoCrane size={20} color="black" />
  </div>
</foreignObject>
<foreignObject x={9 * cellSize + 10} y={7 * cellSize + 10} width={24} height={24}>
  <div style={{ width: '100%', height: '100%' }}>
    <GiCargoCrane size={20} color="black" />
  </div>
</foreignObject>
<foreignObject x={9 * cellSize + 10} y={9 * cellSize + 10} width={24} height={24}>
  <div style={{ width: '100%', height: '100%' }}>
    <GiCargoCrane size={20} color="black" />
  </div>
</foreignObject>

{/* Boxes */}
<rect x={3 * cellSize + 10} y={7 * cellSize + 10} width="15" height="15" fill="#A6744A" />
<rect x={3.4 * cellSize + 10} y={6.8 * cellSize + 20} width="15" height="15" fill="#A6744A" />
<rect x={2 * cellSize + 10} y={7.5 * cellSize + 10} width="15" height="15" fill="#A6744A" />
<rect x={2.4 * cellSize + 10} y={7.5 * cellSize + 10} width="15" height="15" fill="#A6744A" />
<rect x={1 * cellSize + 10} y={10 * cellSize + 10} width="15" height="15" fill="#A6744A" />
<rect x={1.4 * cellSize + 10} y={10 * cellSize + 10} width="15" height="15" fill="#A6744A" />
<text x={3.25 * cellSize} y={7 * cellSize + 5} fontSize="10" fill={isDarkMode ? "#39FF14" : "#000"}>Boxes</text>

      <text
        x="-100"
        y="25"
        fontFamily="Times New Roman"
        fontSize={isMobile ? '12' : '16'}
        fill={isDarkMode ? '#fff' : '#000'}
      >
        Asset Area
      </text>
      <text
        x="-110"
        y={rows * cellSize + 30}
        fontFamily="Times New Roman"
        fontSize={isMobile ? '12' : '16'}

        fill={isDarkMode ? '#fff' : '#000'}
      >
        Storage Area
      </text>
      <text
        x={cols * cellSize + 75}
        y={rows * cellSize + 30}
        fontFamily="Times New Roman"
        fontSize={isMobile ? '12' : '16'}

        fill={isDarkMode ? '#fff' : '#000'}
      >
        Service Area
      </text>
    </svg>
  );
};

const Dashboard = () => {
  const [trailPath, setTrailPath] = useState([]);
  const [currentPos, setCurrentPos] = useState(null);
  const [panelOpen, setPanelOpen] = useState(window.innerWidth > 768);
  const [activeToggle, setActiveToggle] = useState('Live Tracking');
  const [activeButton, setActiveButton] = useState('1 Hour');
  const [activeAsset, setActiveAsset] = useState('Forklifts');
  const [expandedId, setExpandedId] = useState(null);
  const [finalPathLength, setFinalPathLength] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const movementRef = useRef(null);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setPanelOpen(!mobile);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cellSize = isMobile ? 30 : 50;

  const predefinedPaths = {
    '1': [ { x: 1 * cellSize, y: 1 * cellSize }, { x: 2 * cellSize, y: 1 * cellSize }, { x: 3 * cellSize, y: 2 * cellSize }, { x: 5 * cellSize, y: 2 * cellSize }, { x: 7 * cellSize, y: 3 * cellSize }, { x: 8 * cellSize, y: 5 * cellSize }, { x: 10 * cellSize, y: 7 * cellSize }, { x: 10 * cellSize, y: 10 * cellSize } ],
    '2': [ { x: 2 * cellSize, y: 2 * cellSize }, { x: 2 * cellSize, y: 4 * cellSize }, { x: 3 * cellSize, y: 6 * cellSize }, { x: 5 * cellSize, y: 7 * cellSize }, { x: 5 * cellSize, y: 9 * cellSize }, { x: 2 * cellSize, y: 9 * cellSize }, { x: 0 * cellSize, y: 10 * cellSize } ],
    '3': [ { x: 0 * cellSize, y: 0 * cellSize }, { x: 3 * cellSize, y: 1 * cellSize }, { x: 3 * cellSize, y: 3 * cellSize }, { x: 4 * cellSize, y: 5 * cellSize }, { x: 6 * cellSize, y: 6 * cellSize }, { x: 9 * cellSize, y: 6 * cellSize }, { x: 10 * cellSize, y: 6 * cellSize }, { x: 10 * cellSize, y: 10 * cellSize }, { x: 7 * cellSize, y: 10 * cellSize }, { x: 0 * cellSize, y: 10 * cellSize } ],
    '4': [ { x: 10 * cellSize, y: 10 * cellSize }, { x: 8 * cellSize, y: 10 * cellSize }, { x: 6 * cellSize, y: 8 * cellSize }, { x: 5 * cellSize, y: 6 * cellSize }, { x: 5 * cellSize, y: 3 * cellSize }, { x: 3 * cellSize, y: 3 * cellSize }, { x: 3 * cellSize, y: 7 * cellSize }, { x: 0 * cellSize, y: 10 * cellSize }, { x: 0 * cellSize, y: 5 * cellSize }, { x: 0 * cellSize, y: 0 * cellSize } ]
  };

  const handleIdClick = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      setTrailPath([]);
      setCurrentPos(null);
      clearInterval(movementRef.current);
      return;
    }
    setExpandedId(id);
    clearInterval(movementRef.current);
    const path = predefinedPaths[id];
    if (!path) return;
    setFinalPathLength(path.length);
    setTrailPath([]);
    setCurrentPos(null);
    let index = 0;
    movementRef.current = setInterval(() => {
      if (index < path.length) {
        const step = path[index];
        setTrailPath(prev => [...prev, step]);
        setCurrentPos(step);
        index++;
      } else {
        clearInterval(movementRef.current);
      }
    }, 600);
  };

  const handleAssetClick = (label) => {
    setActiveAsset(label);
    setTrailPath([]);
    setCurrentPos(null);
    setExpandedId(null);
    setFinalPathLength(0);
  };

  const handleButtonClick = (label) => setActiveButton(label);
  const getCurrentIds = () => ['Forklifts', 'Operators', 'Cranes'].includes(activeAsset) ? ['1', '2', '3', '4'] : [];

  const buttonStyles = (label, defaultBg, defaultText, activeLabel) => ({
    width: '110px',
    height: '36px',
    borderRadius: '15px',
    border: activeLabel === label 
      ? (isDarkMode ? '2px solid #39FF14' : '2px solid #001f3f') 
      : '1px solid #cbd5e1',
    backgroundColor: activeLabel === label ? (isDarkMode ? '#000' : '#001f3f') : defaultBg,
    fontFamily: 'Times New Roman',
    fontSize: '16px',
    color: activeLabel === label 
      ? (isDarkMode ? '#39FF14' : '#ffffff') 
      : (isDarkMode ? '#ffffff' : defaultText),
    cursor: 'pointer',
    fontWeight: activeLabel === label ? 'bold' : 'normal',
    boxShadow: activeLabel === label 
      ? (isDarkMode ? '0 0 12px #39FF14' : 'none') 
      : '0 2px 6px rgba(0,0,0,0.08)',
    transform: activeLabel === label ? 'translateY(-2px)' : 'translateY(0)',
    transition: 'all 0.2s ease-in-out'
  });

  return (
    <>
      <style>{styles}</style>
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
          position: isMobile ? 'sticky' : 'static',
          top: 0,
          zIndex: 3
        }}>
       <div style={{
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: isMobile ? 'center' : 'stretch',
  textAlign: isMobile ? 'center' : 'left',
  flexWrap: isMobile ? 'wrap' : 'nowrap',
  gap: '10px',
  marginBottom: '10px'
}}>

  {/* Title */}
  <div style={{
    fontSize: isMobile ? '22px' : '25px',
    fontWeight: 'bold',
    fontFamily: 'Times New Roman',
    color: isDarkMode ? '#39FF14' : '#1e293b',
    flex: 1,
    minWidth: '200px'
  }}>
    Real-Time Location Tracker
  </div>
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, flexWrap: 'nowrap' }}>

    {/* Dark Mode Toggle Icon */}
    <div
      onClick={toggleTheme}
      style={{
        width: '38px',
        height: '38px',
        borderRadius: '50%',
        backgroundColor: isDarkMode ? '#1a1a1a' : '#f1f5f9',
        boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer'
      }}
    >
      {isDarkMode ? (
        <FaSun size={18} color="#ffcc00" />
      ) : (
        <FaMoon size={18} color="#334155" />
      )}
    </div>
  </div>
</div>

          <h3 style={{ fontFamily: 'Times New Roman', fontSize: isMobile ? '18px' : '20px', margin: 0, color: isDarkMode ? '#ccc' : '#64748b', textAlign: isMobile ? 'center' : 'left' }}>Warehouse</h3>

          <div style={{
            height: isMobile ? '48vh' : '75vh',
            backgroundColor: isDarkMode ? '#111' : '#fff',
            border: '1px solid #000',
            borderRadius: '5px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '22px',
            marginBottom: '15px',
            overflow: 'auto'
          }}>
            <AssetLayout
              activeAsset={activeAsset}
              trailPath={trailPath}
              currentPos={currentPos}
              showMarker={expandedId !== null}
              finalPathLength={finalPathLength}
              isMobile={isMobile}
              isDarkMode={isDarkMode}
            />
          </div>

          
          {/* Legend below the map holder horizontally placed */}
<div style={{
  marginTop: 12,
  display: 'flex',
  justifyContent: 'center',
  gap: 25,
  alignItems: 'center',
  fontFamily: 'Times New Roman',
  fontSize: 14,
  color: isDarkMode ? '#39FF14' : '#001f3f',
  userSelect: 'none'
}}>
  {/* Small colored dots with labels */}
  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
    <span style={{
      display: 'inline-block',
      width: 12,
      height: 12,
      borderRadius: '50%',
      backgroundColor: 'yellow',
      boxShadow: isDarkMode ? '0 0 6px yellow' : 'none'
    }}></span>
    Forklifts
  </div>
  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
    <span style={{
      display: 'inline-block',
      width: 12,
      height: 12,
      borderRadius: '50%',
      backgroundColor: 'orange',
      boxShadow: isDarkMode ? '0 0 6px orange' : 'none'
    }}></span>
    Cranes
  </div>
  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
    <span style={{
      display: 'inline-block',
      width: 12,
      height: 12,
      borderRadius: '50%',
      backgroundColor: 'blue',
      boxShadow: isDarkMode ? '0 0 6px deepskyblue' : 'none'
    }}></span>
    Operators
  </div>
  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
    <span style={{
      display: 'inline-block',
      width: 8,
      height: 8,
      borderRadius: '50%',
      backgroundColor: isDarkMode ? '#39FF14' : '#6b7280',
      opacity: 0.8
    }}></span>
    Path Trail 
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
    </>
  );
};

export default Dashboard;