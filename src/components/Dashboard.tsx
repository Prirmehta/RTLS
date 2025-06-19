import React, { useState, useEffect } from 'react';
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
@keyframes slideIn {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
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

const AssetLayout = ({ activeAsset, expandedId }) => {
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

  const positions = {
    '1': { x: 100, y: 100 },
    '2': { x: 200, y: 150 },
    '3': { x: 300, y: 200 },
    '4': { x: 150, y: 250 },
  };

  const circles = expandedId && positions[expandedId] ? (
    <>
      <circle
        cx={positions[expandedId].x}
        cy={positions[expandedId].y}
        r="18"
        fill={activeAsset === 'Forklifts' ? 'yellow' : activeAsset === 'Cranes' ? 'orange' : 'blue'}
        stroke="#000"
        strokeWidth="1"
      />
      <text
        x={positions[expandedId].x}
        y={positions[expandedId].y - 25}
        textAnchor="middle"
        className="tooltip"
      >
        {activeAsset === 'Forklifts' ? `ForkliftID: #${expandedId}` : activeAsset === 'Cranes' ? `CraneID: #${expandedId}` : `OperatorID: #${expandedId}`}
      </text>
    </>
  ) : null;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${cols * cellSize} ${rows * cellSize}`}>
      {cells}
      {circles}
    </svg>
  );
};

const Dashboard = () => {
  const [panelOpen, setPanelOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeToggle, setActiveToggle] = useState('Live Tracking');
  const [activeButton, setActiveButton] = useState('');
  const [activeAsset, setActiveAsset] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const handleResize = () => setIsMobile(window.innerWidth < 768);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setPanelOpen(!isMobile);
  }, [isMobile]);

  const handleButtonClick = (label) => setActiveButton(label);
  const handleAssetClick = (label) => {
    setActiveAsset(label);
    setExpandedId(null);
  };
  const handleIdClick = (id) => setExpandedId(prev => (prev === id ? null : id));

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

  const renderDetails = () => (
    <div style={{
      backgroundColor: '#f1f5f9', borderRadius: '12px', marginTop: '8px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.06)', fontFamily: 'Times New Roman', color: '#1e293b',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '16px' }}>
        {['Average Speed', 'Distance Travelled', 'Pace', 'Load Count'].map((title, i) => (
          <div key={i} style={{ backgroundColor: '#e2e8f0', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '13px', marginBottom: '5px' }}>{title}</div>
            <div style={{ fontSize: '15px', fontWeight: 'bold' }}>{['14 km/hr', '14 km', '6 minutes/km', '12'][i]}</div>
          </div>
        ))}
      </div>
      <div style={{
        backgroundColor: '#cbd5e1', borderRadius: '10px', padding: '15px', margin: '15px',
        fontSize: '15px', color: '#1e293b', boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
      }}>
        <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '10px' }}>Path Details</div>
        {['Loading Zone - 10:00 AM', 'Storage Area - 10:30 AM', 'Processing Unit - 11:00 AM', 'Packaging - 11:30 AM', 'Exit - 12:00 PM']
          .map((text, idx) => <div key={idx}>{idx + 1} : {text}</div>)}
      </div>
    </div>
  );

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
              <AssetLayout activeAsset={activeAsset} expandedId={expandedId} />
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
                  <div className={expandedId === id ? 'expand' : 'collapse'}>
                    {expandedId === id && renderDetails()}
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
