// Отвечает за кнопки экспорта, подключает их функционал к exporter
import React from 'react';
import { exportPNG, exportPSD } from '../lib/exporter';

function ExportButtons({ character, psdData, flatLayers }) {
  return (
    <div className="export-buttons">
      <button onClick={() => psdData && flatLayers && exportPNG(character, psdData, flatLayers)}>
        Export PNG
      </button>
      <button onClick={() => psdData && flatLayers && exportPSD(psdData, character, flatLayers)}>
        Export PSD
      </button>
    </div>
  );
}

export default ExportButtons;
