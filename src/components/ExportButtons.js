// src/components/ExportButtons.js
import React, { useState } from 'react';
import { exportPNG, exportPSD } from '../lib/exporter';

function ExportButtons({ character, psdData }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (type) => {
    if (!psdData || isExporting) return;
    
    setIsExporting(true);
    
    try {
      if (type === 'png') {
        await exportPNG(character, psdData);
      } else {
        await exportPSD(psdData, character);
      }
    } catch (error) {
      console.error(`Export ${type} error:`, error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="export-buttons">
      <button 
        onClick={() => handleExport('png')}
        disabled={isExporting}
      >
        {isExporting ? 'Exporting...' : 'Export PNG'}
      </button>
      <button 
        onClick={() => handleExport('psd')}
        disabled={isExporting}
      >
        {isExporting ? 'Exporting...' : 'Export PSD'}
      </button>
    </div>
  );
}

export default ExportButtons;
