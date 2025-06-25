// Отвечает за кнопки экспорта, подключает их функционал к exporter
import React from 'react';
import { exportPNG, exportPSD } from '../lib/exporter';

function ExportButtons({ character, psdData }) {
  return (
    <div className="export-buttons">
      <button onClick={() => psdData && exportPNG(character, psdData)}>Export PNG</button>
      <button onClick={() => psdData && exportPSD(psdData, character)}>Export PSD</button>
    </div>
  );
}

export default ExportButtons;
