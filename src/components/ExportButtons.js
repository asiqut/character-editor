import React, { useRef } from 'react';
import { exportPNG, exportPSD } from '../lib/exporter';

function ExportButtons({ character, psdData }) {
  const canvasRef = useRef(null);

  const handleExportPNG = () => {
    if (canvasRef.current && psdData) {
      exportPNG(canvasRef.current, character, psdData);
    }
  };
  
  const handleExportPSD = () => {
    if (psdData) {
      exportPSD(psdData, character);
    }
  };
  
  return (
    <div className="export-buttons">
      <button onClick={handleExportPNG}>Export PNG</button>
      <button onClick={handleExportPSD}>Export PSD</button>
      
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
