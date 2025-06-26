// Отвечает за кнопки экспорта, подключает их функционал к exporter
import React from 'react';
import { exportPNG, exportPSD } from '../lib/exporter';

function ExportButtons({ character, psdData }) {
  return (
    <div className="export-buttons">
      <button onClick={() => psdData && exportPNG(character, psdData)}>PNG</button>
      <button onClick={() => psdData && exportPSD(psdData, character)}>PSD</button>
    </div>
  );
}

export default ExportButtons;
