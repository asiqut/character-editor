import * as PSD from 'ag-psd';
import { renderCharacter } from './renderer';

export const exportPNG = (canvas, character, psdData) => {
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = 315; // Фиксированный размер
  exportCanvas.height = 315;
  
  // Рендерим с флагом isExport
  renderCharacter(exportCanvas, psdData, character, { isExport: true });
  
  const link = document.createElement('a');
  link.download = `character_${Date.now()}.png`;
  link.href = exportCanvas.toDataURL('image/png');
  link.click();
};

export const exportPSD = (psdData, character) => {
  const newPsd = {
    width: 315,
    height: 315,
    children: []
  };

  const partsOrder = ['tail', 'body', 'mane', 'head', 'cheeks', 'eyes', 'ears'];
  
  partsOrder.forEach(part => {
    const partVariant = character[part];
    if (!partVariant) return;
    
    const variant = part === 'eyes' 
      ? `${character.eyes.type}/${character.eyes.subtype}`
      : partVariant;
    
    const layers = psdData[part]?.[variant] || [];
    
    layers.forEach(layer => {
      if (layer.canvas) {
        newPsd.children.push({
          name: `${part}/${variant}/${layer.name}`,
          canvas: layer.canvas,
          left: layer.left,
          top: layer.top,
          opacity: layer.opacity,
          blendMode: layer.blendMode,
          clipping: layer.clipping
        });
      }
    });
  });

  const psdBytes = PSD.writePsd(newPsd);
  const blob = new Blob([psdBytes], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `character_${Date.now()}.psd`;
  a.click();
  
  URL.revokeObjectURL(url);
};
