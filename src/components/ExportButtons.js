import React, { useRef } from 'react';
import { exportPNG, exportPSD } from '../lib/exporter';

function ExportButtons({ character, psdData }) {
  const handleExportPNG = async () => {
    if (!psdData) return;
    
    // Создаем временный canvas для рендеринга
    const canvas = document.createElement('canvas');
    canvas.width = 315;
    canvas.height = 315;
    
    // Используем функцию экспорта
    exportPNG(canvas, character, psdData);
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
    </div>
  );
}

export default ExportButtons;
