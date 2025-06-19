import React, { useState, useEffect, useRef } from 'react';
import { BiArrowBack } from "react-icons/bi";
import { MdAccessTime } from "react-icons/md";
import { FaRobot } from "react-icons/fa";

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
`;

const AssetLayout = ({ activeAsset, trailPath, currentPos, showMarker, finalPathLength }) => {
  const rows = 10;
  const cols = 10;
  const cellSize = 50;
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
          fill="none"
          stroke="#000"
          strokeWidth="1"
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
    return (
      <React.Fragment key={`trail-${index}`}>
        <rect
          x={step.x}
          y={step.y}
          width={cellSize}
          height={cellSize}
          fill={isLastStep ? 'green' : (areaColors[step.label] || '#888')}
          opacity={0.6}
        />
        {isLastStep && (
          <text
            x={step.x + cellSize / 2}
            y={step.y - 10}
            textAnchor="middle"
            fontFamily="Times New Roman"
            fontSize="14"
            fontWeight="bold"
            fill="green"
          >
            Destination Reached
          </text>
        )}
      </React.Fragment>
    );
  });

  const marker = showMarker && currentPos && (
    <>
      <circle
        cx={currentPos.x + cellSize / 2}
        cy={currentPos.y + cellSize / 2}
        r="14"
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
  const [panelOpen, setPanelOpen] = useState(true);
  const [activeToggle, setActiveToggle] = useState('Live Tracking');
  const [activeButton, setActiveButton] = useState('1 Hour');
  const [activeAsset, setActiveAsset] = useState('Forklifts');
  const [expandedId, setExpandedId] = useState(null);
  const [finalPathLength, setFinalPathLength] = useState(0);
  const isMobile = false;
  const movementRef = useRef(null);

  const predefinedPaths = {
    '1': [ { row: 1, col: 1 }, { row: 1, col: 2 }, { row: 1, col: 3 }, { row: 2, col: 3 }, { row: 2, col: 4 },{ row: 2, col: 5 },{ row: 2, col: 6}, { row: 2, col: 7}, { row: 2, col: 8}, { row: 3, col: 8 },{ row: 4, col: 8 },{ row: 4, col: 9}, { row: 5, col: 9}, { row: 5, col: 10}, { row: 6, col: 10},{ row: 7, col: 10},{ row: 8, col: 10},{ row: 9, col: 10},{ row: 10, col: 10 }],
    '2': [ { row: 2, col: 2 }, { row: 3, col: 2 }, { row: 4, col: 2 }, { row: 4, col: 3 },{ row: 4, col: 4}, { row: 4, col: 5 },{ row: 3, col: 5 }, { row: 2, col: 5 },{ row: 1, col: 5 },{ row: 0, col: 5 },{ row: 0, col: 4 },{ row: 0, col: 3 },{ row: 0, col: 2 },{ row: 0, col: 1 }, { row: 0, col: 0}],
    '3': [ { row: 3, col: 1 }, { row: 3, col: 2 }, { row: 3, col: 3 }, { row: 3, col: 4 } ],
    '4': [ { row: 4, col: 4 }, { row: 5, col: 4 }, { row: 5, col: 5 } ]
  };

  const handleIdClick = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
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
        const x = step.col * 50;
        const y = step.row * 50;
        setTrailPath(prev => [...prev, { x, y }]);
        setCurrentPos({ x, y });
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
      <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', backgroundColor: '#ffffff' }}>
        <div style={{
          flex: panelOpen ? 2 : 1,
          padding: '30px',
          backgroundColor: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '25px', fontWeight: 'bold', fontFamily: 'Times New Roman', color: '#1e293b', marginBottom: '2px' }}>
              Real-Time Location Tracker
            </div>
            <h3 style={{ fontFamily: 'Times New Roman', fontSize: '20px', margin: 0, color: '#64748b' }}>Warehouse</h3>
            <div style={{
              height: '75vh',
              backgroundColor: '#fff',
              border: '1px solid #000',
              borderRadius: '5px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              fontSize: '22px', marginBottom: '20px', overflow: 'auto'
            }}>
              <AssetLayout
                activeAsset={activeAsset}
                trailPath={trailPath}
                currentPos={currentPos}
                showMarker={expandedId !== null}
                finalPathLength={finalPathLength}
              />
            </div>
          </div>

          <div style={{
            backgroundColor: '#f1f5f9',
            borderRadius: '15px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
            padding: '15px 20px',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            fontFamily: 'Times New Roman',
            fontSize: '16px',
            color: '#1e293b'
          }}>
            {['Forklift', 'Operator', 'Crane', 'Destination', 'Work'].map((label, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '1px solid #000' }}></div>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {panelOpen && (
          <div style={{
            width: isMobile ? '100%' : '420px',
            height: '100vh',
            backgroundColor: '#ffffff',
            boxShadow: '0 0 12px rgba(0,0,0,0.08)',
            padding: '30px 25px',
            display: 'flex', flexDirection: 'column', gap: '25px',
            position: isMobile ? 'absolute' : 'relative', right: 0, top: 0,
            zIndex: 5, overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div onClick={() => setPanelOpen(false)} style={{
                width: '45px', height: '45px', borderRadius: '50%',
                backgroundColor: '#f1f5f9', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.06)',
                display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer'
              }}>
                <BiArrowBack size={24} color="#1e293b" style={{ transform: 'rotate(45deg)' }} />
              </div>
              <div className="toggle-btns">
                <button className={activeToggle === 'Live Tracking' ? 'active' : ''} onClick={() => setActiveToggle('Live Tracking')}>
                  Live Tracking
                </button>
                <button className={activeToggle === 'Heat Map' ? 'active' : ''} onClick={() => setActiveToggle('Heat Map')}>
                  Heat Map
                </button>
              </div>
            </div>

            <div style={{ backgroundColor: '#f1f5f9', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <MdAccessTime size={18} color="#001f3f" />
                <span style={{ fontFamily: 'Times New Roman', fontSize: '18px', color: '#1e293b' }}>Time Range</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {['1 Hour', '1 Day', '1 Week'].map((label) => (
                  <button
                    key={label}
                    style={buttonStyles(label, '#e2e8f0', '#1e293b', activeButton)}
                    onClick={() => handleButtonClick(label)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{
              backgroundColor: '#f1f5f9', borderRadius: '15px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
              padding: '20px', flex: 1, overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <FaRobot size={18} color="#001f3f" />
                <span style={{ fontFamily: 'Times New Roman', fontSize: '18px', color: '#1e293b' }}>Asset Type</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '15px' }}>
                {['Forklifts', 'Operators', 'Cranes'].map((label) => (
                  <button
                    key={label}
                    style={buttonStyles(label, '#e2e8f0', '#1e293b', activeAsset)}
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
                      padding: '10px', fontSize: '16px', fontFamily: 'Times New Roman',
                      color: expandedId === id ? '#001f3f' : '#1e293b',
                      fontWeight: expandedId === id ? 'bold' : 'normal',
                      cursor: 'pointer', borderRadius: '10px',
                      backgroundColor: expandedId === id ? '#e0f2fe' : 'transparent',
                      transition: 'all 0.3s ease'
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
        {!panelOpen && (
          <div onClick={() => setPanelOpen(true)} style={{
            position: 'absolute', top: '30px', right: '20px',
            width: '45px', height: '45px', borderRadius: '50%',
            backgroundColor: '#f1f5f9', boxShadow: '0 4px 8px rgba(0,0,0,0.08)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            cursor: 'pointer', zIndex: 20
          }}>
            <BiArrowBack size={24} color="#1e293b" style={{ transform: 'rotate(225deg)' }} />
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
