import React, { useState } from 'react';
import { exportPNG, exportPSD } from '../lib/exporter';

function ExportButtons({ character, psdData }) {
  const [isExporting, setIsExporting] = useState(false);
  const [lastError, setLastError] = useState(null);

  const handleExport = async (type) => {
    if (!psdData || isExporting) return;
    
    setIsExporting(true);
    setLastError(null);
    
    try {
      const success = type === 'png' 
        ? await exportPNG(character, psdData)
        : await exportPSD(psdData, character);
      
      if (!success) {
        setLastError(`Failed to export ${type.toUpperCase()}`);
      }
    } catch (error) {
      setLastError(error.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="export-buttons">
      <button 
        onClick={() => handleExport('png')}
        disabled={isExporting || !psdData}
      >
        {isExporting ? 'Exporting...' : 'Export PNG'}
      </button>
      
      <button 
        onClick={() => handleExport('psd')}
        disabled={isExporting || !psdData}
      >
        {isExporting ? 'Exporting...' : 'Export PSD'}
      </button>
      
      {lastError && (
        <div className="export-error">
          Error: {lastError}
        </div>
      )}
    </div>
  );
}

export default ExportButtons;
