import React, { useState } from 'react';
import { exportPNG, exportPSD } from '../lib/exporter';

function ExportButtons({ character, psdData }) {
  const handleExportPNG = () => {
    if (psdData) exportPNG(character, psdData);
  };

  const handleExportPSD = () => {
    if (psdData) exportPSD(psdData, character);
  };

  return (
    <div className="export-buttons">
      <button onClick={handleExportPNG}>Export PNG</button>
      <button onClick={handleExportPSD}>Export PSD</button>
    </div>
  );
}

export default ExportButtons;
