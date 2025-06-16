import * as PSD from 'ag-psd';
import { renderCharacter } from './renderer';

export const exportPNG = (canvas, character, psdData) => {
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = 800;
  exportCanvas.height = 800;
  
  renderCharacter(exportCanvas, psdData, character);
  
  const link = document.createElement('a');
  link.download = `character_${Date.now()}.png`;
  link.href = exportCanvas.toDataURL('image/png');
  link.click();
};

export const exportPSD = (psdData, character) => {
  const newPsd = {
    width: 800,
    height: 800,
    children: []
  };

  const partsOrder = ['ears', 'eyes', 'cheeks', 'head', 'mane', 'body', 'tail'];
  
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
          opacity: layer.opacity
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
