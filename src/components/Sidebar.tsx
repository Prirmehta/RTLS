import React from 'react';
import { AiOutlineEnvironment, AiOutlineLogout } from "react-icons/ai";
import { AiOutlineHeatMap } from "react-icons/ai";
import { TbLiveView } from "react-icons/tb";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { IoMdSettings } from "react-icons/io";

const labelStyle: React.CSSProperties = {
  fontFamily: 'Times New Roman, serif',
  fontSize: '18px',
  color: '#fff',
  marginTop: '8px',
  textAlign: 'center',
};

const Sidebar: React.FC = () => {
  return (
    <div style={{
      width: '98px',  // increased width
      backgroundColor: '#111',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px 0',
      height: '100vh',
    }}>
      
      {/* Location icon fixed at top */}
      <div>
        <AiOutlineEnvironment size={32} color="#fff" />
      </div>

      {/* Middle icons */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        flex: 1,
        paddingTop: '-15px',
        paddingBottom: '40px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <AiOutlineHeatMap size={24} color="#fff" />
          <div style={labelStyle}>Heatmap</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <TbLiveView size={24} color="#fff" />
          <div style={labelStyle}>Live Tracker</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <HiOutlineDocumentReport size={24} color="#fff" />
          <div style={labelStyle}>Reports</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <IoMdSettings size={24} color="#fff" />
          <div style={labelStyle}>Settings</div>
        </div>
      </div>

      {/* Logout icon */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '60px' }}>
        <AiOutlineLogout size={24} color="#fff" />
        <div style={labelStyle}>Logout</div>
      </div>

    </div>
  );
};

export default Sidebar;
