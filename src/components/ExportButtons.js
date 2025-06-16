import React, { useRef } from 'react';
import { exportPNG, exportPSD } from '../lib/exporter';

function ExportButtons({ character, psdData }) {
  const handleExport = async (type) => {
    if (!psdData) return;
    
    try {
      if (type === 'png') {
        const { exportPNG } = await import('../lib/exporter');
        exportPNG(character, psdData);
      } else {
        const { exportPSD } = await import('../lib/exporter');
        exportPSD(psdData, character);
      }
    } catch (error) {
      console.error(`Export ${type} error:`, error);
    }
  };

  return (
    <div className="export-buttons">
      <button onClick={() => handleExport('png')}>Export PNG</button>
      <button onClick={() => handleExport('psd')}>Export PSD</button>
    </div>
  );
}

export default ExportButtons;
