// src/components/ExportButtons.js
import React from 'react';
import { exportPNG, exportPSD } from '../lib/exporter';

function ExportButtons({ character, psdData }) {
  const handleExportPNG = () => {
    exportPNG(psdData, character);
  };
  
  const handleExportPSD = () => {
    exportPSD(psdData, character);
  };
  
  return (
    <div className="export-buttons">
      <button onClick={handleExportPNG}>Export PNG</button>
      <button onClick={handleExportPSD}>Export PSD</button>
    </div>
  );
}

export default ExportButtons;
