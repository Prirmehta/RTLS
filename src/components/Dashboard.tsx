import React, { useState, useEffect, useRef } from 'react';
import { BiArrowBack } from "react-icons/bi";
import { MdAccessTime } from "react-icons/md";
import { FaRobot } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";

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
  background-color: #f0f4f8;
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
  color: #334155;
}
.toggle-btns button.active {
  background-color: #001f3f;
  color: white;
  font-weight: bold;
}
.tooltip {
  font-family: 'Times New Roman';
  font-size: 13px;
  fill: #000000;
}
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

const AssetLayout = ({ activeAsset, trailPath, currentPos, showMarker, finalPathLength, isMobile }) => {
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
          fill="rgba(200,200,200,0.2)" // ✅ Light grey translucent grid
          stroke="#aaa"
          strokeWidth="0.8"
        />
      );
    }
  }

  const areaColors = {
    'Storage': '#007bff',
    'Asset': '#ff9800',
    'Service': '#4caf50'
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
          fill={isLastStep ? 'green' : (areaColors[step.label] || '#888')}
          opacity={0.8}
        />
        {isFirstStep && (
          <text
            x={step.x + cellSize / 2}
            y={step.y - 10}
            textAnchor="middle"
            fontFamily="Times New Roman"
            fontSize="13"
            fill="#333"
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
            fill="green"
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
        stroke="#444"
        strokeWidth="2"
        strokeDasharray="4"
      />
    );
  });

  const marker = showMarker && currentPos && (
    <>
      <circle
        cx={currentPos.x + cellSize / 2}
        cy={currentPos.y + cellSize / 2}
        r={isMobile ? 8 : 14}
        fill={activeAsset === 'Forklifts' ? 'yellow' : activeAsset === 'Cranes' ? 'orange' : 'blue'}
        stroke="#000"
        strokeWidth="1"
      />
      <text
        x={currentPos.x + cellSize / 2}
        y={currentPos.y + cellSize / 2 - 20}
        textAnchor="middle"
        className="tooltip"
      >
        {activeAsset} Tracking
      </text>
    </>
  );

  return (
    <svg width="100%" height="100%" viewBox={`-60 -25 ${cols * cellSize + 120} ${rows * cellSize + 100}`}>
      {cells}
      {trailLines}
      {trailCircles}
      {marker}
      <text x="-100" y="25" fontFamily="Times New Roman" fontSize="16" fill="#000">
        Asset Area
      </text>
      <text x="-110" y={rows * cellSize + 30} fontFamily="Times New Roman" fontSize="16" fill="#000">
        Storage Area
      </text>
      <text x={cols * cellSize + 75} y={rows * cellSize + 30} fontFamily="Times New Roman" fontSize="16" fill="#000">
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
  const movementRef = useRef(null);

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
    '1': [
      { x: 1 * cellSize, y: 1 * cellSize },
      { x: 2 * cellSize, y: 1 * cellSize },
      { x: 3 * cellSize, y: 2 * cellSize },
      { x: 5 * cellSize, y: 2 * cellSize },
      { x: 7 * cellSize, y: 3 * cellSize },
      { x: 8 * cellSize, y: 5 * cellSize },
      { x: 10 * cellSize, y: 7 * cellSize },
      { x: 10 * cellSize, y: 10 * cellSize },
    ],
    '2': [
      { x: 2 * cellSize, y: 2 * cellSize },
      { x: 2 * cellSize, y: 4 * cellSize },
      { x: 3 * cellSize, y: 6 * cellSize },
      { x: 5 * cellSize, y: 7 * cellSize },
      { x: 5 * cellSize, y: 9 * cellSize },
      { x: 2 * cellSize, y: 9 * cellSize },
      { x: 0 * cellSize, y: 10 * cellSize }
      
    ],
    '3': [
      { x: 0 * cellSize, y: 0 * cellSize },
      { x: 3 * cellSize, y: 1 * cellSize },
      { x: 3 * cellSize, y: 3 * cellSize },
      { x: 4 * cellSize, y: 5 * cellSize },
      { x: 6 * cellSize, y: 6 * cellSize },
      { x: 9 * cellSize, y: 6 * cellSize },
      { x: 10 * cellSize, y: 6 * cellSize },
      { x: 10 * cellSize, y: 10 * cellSize },
      { x: 7 * cellSize, y: 10 * cellSize },
      { x: 0 * cellSize, y: 10 * cellSize },
    ],
    '4': [
      { x: 10 * cellSize, y: 10 * cellSize },
      { x: 8 * cellSize, y: 10 * cellSize },
      { x: 6 * cellSize, y: 8 * cellSize },
      { x: 5 * cellSize, y: 6 * cellSize },
      { x: 5 * cellSize, y: 3 * cellSize },
      { x: 3 * cellSize, y: 3 * cellSize },
      { x: 3 * cellSize, y: 7 * cellSize },
      { x: 0 * cellSize, y: 10 * cellSize },
      { x: 0 * cellSize, y: 5 * cellSize },
      { x: 0 * cellSize, y: 0 * cellSize },
     
    ]
  };

  const handleIdClick = (id) => {
    if (expandedId === id) {
      // If already selected, clicking again will deselect
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

  const handleButtonClick = (label) => {
    setActiveButton(label);
  };

  const assetIds = ['1', '2', '3', '4'];
  const getCurrentIds = () =>
    ['Forklifts', 'Operators', 'Cranes'].includes(activeAsset) ? assetIds : [];

  const buttonStyles = (label, defaultBg, defaultText, activeLabel) => ({
    width: '110px', height: '36px', borderRadius: '15px',
    border: activeLabel === label ? '2px solid #001f3f' : '1px solid #cbd5e1',
    backgroundColor: activeLabel === label ? '#001f3f' : defaultBg,
    fontFamily: 'Times New Roman',
    fontSize: '16px',
    color: activeLabel === label ? '#ffffff' : defaultText,
    cursor: 'pointer',
    fontWeight: activeLabel === label ? 'bold' : 'normal',
    boxShadow: activeLabel === label ? '0 4px 10px rgba(0, 0, 0, 0.2)' : '0 2px 6px rgba(0,0,0,0.08)',
    transform: activeLabel === label ? 'translateY(-2px)' : 'translateY(0)',
    transition: 'all 0.2s ease-in-out'
  });

  return (
    <>
      <style>{styles}</style>
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#ffffff'
      }}>
        {/* Left Panel */}
        <div style={{
          flex: panelOpen ? 2 : 1,
          padding: isMobile ? '10px 15px' : '30px',
          backgroundColor: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          height: isMobile ? 'auto' : '100%',
          position: isMobile ? 'sticky' : 'static',
          top: 0,
          zIndex: 3
        }}>
          <div style={{ fontSize: isMobile ? '22px' : '25px', fontWeight: 'bold', fontFamily: 'Times New Roman', color: '#1e293b', marginBottom: '5px', textAlign: isMobile ? 'center' : 'left' }}>
            Real-Time Location Tracker
          </div>
          <h3 style={{ fontFamily: 'Times New Roman', fontSize: isMobile ? '18px' : '20px', margin: 0, color: '#64748b', textAlign: isMobile ? 'center' : 'left' }}>Warehouse</h3>

          <div style={{
            height: isMobile ? '48vh' : '75vh',
            backgroundColor: '#fff',
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
            />
          </div>

          <div style={{
            backgroundColor: '#f1f5f9',
            borderRadius: '15px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
            padding: '12px 18px',
            marginBottom: '15px',
            display: 'flex',
            justifyContent: isMobile ? 'center' : 'space-around',
            alignItems: 'center',
            flexWrap: isMobile ? 'wrap' : 'nowrap',
            fontFamily: 'Times New Roman',
            fontSize: '15px',
            gap: isMobile ? '12px' : '0',
            color: '#1e293b'
          }}>
            {[
              { color: 'yellow', label: 'Forklift' },
              { color: 'blue', label: 'Operator' },
              { color: 'orange', label: 'Crane' },
              { color: 'green', label: 'Destination' },
              { color: '#888888', label: 'Work' }
            ].map((item, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '14px', height: '14px', borderRadius: '50%',
                  backgroundColor: item.color, border: '1px solid #000'
                }}></div>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        {panelOpen && (
          <div style={{
            width: isMobile ? '100%' : '420px',
            height: isMobile ? 'auto' : '100vh',
            backgroundColor: '#ffffff',
            boxShadow: '0 0 12px rgba(0,0,0,0.08)',
            padding: isMobile ? '20px' : '30px 25px',
            display: 'flex',
            flexDirection: 'column',
            gap: '25px',
            overflowY: isMobile ? 'scroll' : 'auto'
          }} className="scroll-panel">
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
              <div onClick={() => setPanelOpen(false)} style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#f1f5f9', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.06)', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}>
                <GiHamburgerMenu size={20} color="#1e293b" />
              </div>
              <div className="toggle-btns" style={{ flexGrow: 1 }}>
                <button className={activeToggle === 'Live Tracking' ? 'active' : ''} onClick={() => setActiveToggle('Live Tracking')}>Live Tracking</button>
                <button className={activeToggle === 'Heat Map' ? 'active' : ''} onClick={() => setActiveToggle('Heat Map')}>Heat Map</button>
              </div>
            </div>

            <div style={{ backgroundColor: '#f1f5f9', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <MdAccessTime size={18} color="#001f3f" />
                <span style={{ fontFamily: 'Times New Roman', fontSize: '18px', color: '#1e293b' }}>Time Range</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {['1 Hour', '1 Day', '1 Week'].map(label => (
                  <button key={label} style={buttonStyles(label, '#e2e8f0', '#1e293b', activeButton)} onClick={() => handleButtonClick(label)}>{label}</button>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: '#f1f5f9', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <FaRobot size={18} color="#001f3f" />
                <span style={{ fontFamily: 'Times New Roman', fontSize: '18px', color: '#1e293b' }}>Asset Type</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' }}>
                {['Forklifts', 'Operators', 'Cranes'].map(label => (
                  <button key={label} style={buttonStyles(label, '#e2e8f0', '#1e293b', activeAsset)} onClick={() => handleAssetClick(label)}>{label}</button>
                ))}
              </div>
              <div style={{ height: '2px', backgroundColor: '#cbd5e1', marginBottom: '10px' }}></div>
              {getCurrentIds().map(id => (
                <div key={id} style={{ marginBottom: '10px' }}>
                  <div style={{
                    padding: '10px', fontSize: '16px', fontFamily: 'Times New Roman',
                    color: expandedId === id ? '#001f3f' : '#1e293b',
                    fontWeight: expandedId === id ? 'bold' : 'normal',
                    cursor: 'pointer',
                    borderRadius: '10px',
                    backgroundColor: expandedId === id ? '#e0f2fe' : 'transparent',
                    transition: 'all 0.3s ease'
                  }} onClick={() => handleIdClick(id)}>
                    {activeAsset === 'Forklifts' ? `ForkliftID : #${id}` : activeAsset === 'Cranes' ? `CraneID : #${id}` : `OperatorID : #${id}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hamburger to reopen */}
        {!panelOpen && (
          <div onClick={() => setPanelOpen(true)} style={{
            position: 'absolute', top: '30px', right: '20px', width: '45px', height: '45px',
            borderRadius: '50%', backgroundColor: '#f1f5f9',
            boxShadow: '0 4px 8px rgba(0,0,0,0.08)', display: 'flex',
            justifyContent: 'center', alignItems: 'center', cursor: 'pointer', zIndex: 20
          }}>
            <GiHamburgerMenu size={20} color="#1e293b" />
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
