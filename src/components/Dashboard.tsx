import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { FaUserCircle, FaRobot } from 'react-icons/fa';
import { IoMdNotificationsOutline } from 'react-icons/io';
import { BiArrowBack } from "react-icons/bi";
import { MdAccessTime } from "react-icons/md";

const styles = `
@keyframes blink {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.4); opacity: 0.6; }
  100% { transform: scale(1); opacity: 1; }
}
.expand {
  max-height: 1000px;
  opacity: 1;
  transition: max-height 0.5s ease, opacity 0.5s ease;
}
.collapse {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transition: max-height 0.5s ease, opacity 0.5s ease;
}
`;

const Dashboard = () => {
  const [activeButton, setActiveButton] = useState('');
  const [activeAsset, setActiveAsset] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const handleButtonClick = (label) => {
    setActiveButton(label);
  };

  const handleAssetClick = (label) => {
    setActiveAsset(label);
    setExpandedId(null);
  };

  const handleIdClick = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const buttonStyles = (label, bgColor, textColor, activeLabel) => ({
    width: '110px',
    height: '36px',
    borderRadius: '15px',
    border: activeLabel === label ? '2px solid red' : '1px solid #ccc',
    backgroundColor: bgColor,
    fontFamily: 'Times New Roman',
    fontSize: '16px',
    color: textColor,
    cursor: 'pointer',
    boxShadow: activeLabel === label ? '0 4px 10px rgba(0,0,0,0.3)' : '0 2px 6px rgba(0,0,0,0.1)',
    transform: activeLabel === label ? 'translateY(-3px)' : 'translateY(0)',
    transition: 'all 0.2s ease-in-out'
  });

  const machineIds = ['1', '2', '3', '4'];
  const peopleIds = ['1', '2', '3', '4'];

  const getCurrentIds = () => {
    if (activeAsset === 'Machines') return machineIds;
    if (activeAsset === 'People') return peopleIds;
    return [];
  };

  const renderDetails = () => {
    return (
      <div style={{
        backgroundColor: '#f9f9f9',
        borderRadius: '12px',
        marginTop: '8px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
        fontFamily: 'Times New Roman',
        color: '#333',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          padding: '16px'
        }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '13px', marginBottom: '5px' }}>Average Speed</div>
            <div style={{ fontSize: '15px', fontWeight: 'bold' }}>14 km/hr</div>
          </div>

          <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '13px', marginBottom: '5px' }}>Distance Travelled</div>
            <div style={{ fontSize: '15px', fontWeight: 'bold' }}>14 km</div>
          </div>

          <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '13px', marginBottom: '5px' }}>Pace</div>
            <div style={{ fontSize: '15px', fontWeight: 'bold' }}>6 minutes/km</div>
          </div>

          <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '13px', marginBottom: '5px' }}>Load Count</div>
            <div style={{ fontSize: '15px', fontWeight: 'bold' }}>12</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#0d0d0d' }}>
      <style>{styles}</style>

      <Sidebar />

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1px' }}>
        <div style={{
          width: 'calc(100% - 70px)',
          height: 'calc(100% - 70px)',
          maxWidth: '1256px',
          maxHeight: '670px',
          backgroundColor: '#fff',
          borderRadius: '35px',
          border: '3px solid #000',
          boxShadow: `0 40px 80px rgba(0, 0, 0, 0.35), 0 20px 40px rgba(0, 0, 0, 0.2)`,
          transition: 'all 0.3s ease-in-out',
          display: 'flex',
          overflow: 'hidden'
        }}>

          {/* Left Section */}
          <div style={{ flex: 1.2, padding: '2px' }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginTop: '5px', marginLeft: '20px', marginRight: '20px'
            }}>
              <h3 style={{ fontFamily: 'Times New Roman', fontSize: '22px' }}>Warehouse</h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{
                    width: '12px', height: '12px', borderRadius: '50%',
                    backgroundColor: '#32CD32', animation: 'blink 1.5s infinite'
                  }}></div>
                  <span style={{ color: '#32CD32', fontFamily: 'Times New Roman', fontSize: '16px' }}>
                    Active
                  </span>
                </div>
                <IoMdNotificationsOutline size={28} color="#000" />
                <FaUserCircle size={28} color="#000" style={{ marginTop: '-2px' }} />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{
            width: '2px', background: 'linear-gradient(to bottom, #ddd, #aaa)',
            boxShadow: '0 0 5px rgba(0,0,0,0.2)', padding: '1px', marginTop: '5px', marginBottom: '5px'
          }} />

          {/* Right Section */}
          <div style={{ flex: 0.4, padding: '20px', display: 'flex', flexDirection: 'column' }}>
            {/* Back button + Live Tracking */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', gap: '15px' }}>
              <div style={{
                width: '45px', height: '45px', borderRadius: '50%',
                backgroundColor: '#f5f5f5', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                cursor: 'pointer'
              }}>
                <BiArrowBack size={24} color="#555" style={{ transform: 'rotate(45deg)' }} />
              </div>

              <div style={{
                flex: 1, backgroundColor: '#f5f5f5', borderRadius: '35px',
                padding: '8px 20px', marginRight: '2px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              }}>
                <span style={{ fontFamily: 'Times New Roman', fontSize: '18px', color: '#555' }}>
                  Live Tracking
                </span>
              </div>
            </div>

            {/* Time Range Rectangle */}
            <div style={{
              margin: '0 auto 5px auto',
              backgroundColor: '#f5f5f5',
              borderRadius: '15px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              padding: '20px',
              height: '120px',
              width: '306px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
                <MdAccessTime size={18} color="#111" />
                <span style={{ fontFamily: 'Times New Roman', fontSize: '18px', color: '#111' }}>
                  Time Range
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '8px' }}>
                <button style={buttonStyles('1 Hour', '#D2DFD8', '#333', activeButton)} onClick={() => handleButtonClick('1 Hour')}>1 Hour</button>
                <button style={buttonStyles('1 Day', '#D3F090', 'black', activeButton)} onClick={() => handleButtonClick('1 Day')}>1 Day</button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button style={buttonStyles('1 Week', '#18402E', 'white', activeButton)} onClick={() => handleButtonClick('1 Week')}>1 Week</button>
              </div>
            </div>

            {/* Asset Type Rectangle */}
            <div style={{
              width: '306px',
              height: '312px',
              margin: '0 auto',
              backgroundColor: '#f5f5f5',
              borderRadius: '15px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <FaRobot size={18} color="#111" />
                <span style={{ fontFamily: 'Times New Roman', fontSize: '18px', color: '#111' }}>Asset Type</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
                <button style={buttonStyles('Machines', '#FFD580', 'black', activeAsset)} onClick={() => handleAssetClick('Machines')}>Machines</button>
                <button style={buttonStyles('People', '#B0E0E6', 'black', activeAsset)} onClick={() => handleAssetClick('People')}>People</button>
              </div>

              <div style={{ height: '2px', width: '100%', backgroundColor: '#ccc', boxShadow: '0 1px 5px rgba(0,0,0,0.2)', borderRadius: '2px', marginBottom: '10px' }}></div>

              {/* Scrollable IDs */}
              <div style={{ overflowY: 'auto', maxHeight: '130px' }}>
                {getCurrentIds().map(id => (
                  <div key={id} style={{ marginBottom: '10px' }}>
                    <div
                      style={{
                        padding: '10px',
                        fontFamily: 'Times New Roman',
                        fontSize: '16px',
                        color: '#333',
                        cursor: 'pointer',
                        borderRadius: '10px',
                        backgroundColor: expandedId === id
                          ? (activeAsset === 'Machines' ? '#FFD580' : '#B0E0E6')
                          : 'transparent',
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => handleIdClick(id)}
                    >
                      {activeAsset === 'Machines' ? `MachineID : #${id}` : `PersonID : #${id}`}
                    </div>
                    <div className={expandedId === id ? 'expand' : 'collapse'}>
                      {expandedId === id && renderDetails()}
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
