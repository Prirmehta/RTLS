import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import HeatMap from './components/WarehouseHeatmap'; 

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
       
        <Route path="/" element={<Navigate to="/dashboard" />} />
        
        {/* Dashboard route */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Heatmap route */}
        <Route path="/heatmap" element={<HeatMap />} />
      </Routes>
    </Router>
  );
};

export default App;
