import * as PSD from 'ag-psd';
import { renderCharacter } from './renderer';

export const exportPNG = (canvas, character, psdData) => {
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = 315; // Оригинальный размер
  exportCanvas.height = 315;
  
  renderCharacter(exportCanvas, psdData, character, {
    forExport: true // Без масштабирования
  });
  
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

  // Создаем временный canvas для рендера каждого слоя
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = 315;
  tempCanvas.height = 315;
  const tempCtx = tempCanvas.getContext('2d');
  
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
        tempCtx.clearRect(0, 0, 315, 315);
        tempCtx.drawImage(layer.canvas, layer.left, layer.top);
        
        newPsd.children.push({
          name: `${part}/${variant}/${layer.name}`,
          canvas: tempCanvas,
          left: layer.left,
          top: layer.top,
          opacity: layer.opacity,
          blendMode: layer.blendMode
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
