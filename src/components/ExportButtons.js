import React, { useRef } from 'react';
import { exportPNG, exportPSD } from '../lib/exporter.js';

function ExportButtons({ character, psdData }) {
  const canvasRef = useRef(null);

  const handleExportPNG = () => {
    if (canvasRef.current) {
      exportPNG(canvasRef.current, character);
    }
  };
  
  const handleExportPSD = () => {
    exportPSD(psdData, character);
  };
  
  return (
    <div className="export-buttons">
      <button onClick={handleExportPNG}>Export PNG</button>
      <button onClick={handleExportPSD}>Export PSD</button>
      
      {/* Скрытый canvas для экспорта PNG */}
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={800}
        style={{ display: 'none' }}
      />
    </div>
  );
}

export default ExportButtons;
