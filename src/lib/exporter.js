import * as PSD from 'ag-psd'; // Используем только ag-psd

export const exportPNG = (canvas, character) => {
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = 800;
  exportCanvas.height = 800;
  const ctx = exportCanvas.getContext('2d');
  
  // Отрисовка персонажа на временном canvas
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
  
  // Добавляем слои в PSD в правильном порядке
  const partsOrder = ['body', 'tail', 'mane', 'head', 'ears', 'cheeks', 'eyes'];
  
  partsOrder.forEach(part => {
    const layers = findLayersForPart(psdData, part, character);
    layers.forEach(layer => {
      if (layer.canvas) {
        newPsd.children.push({
          name: layer.name,
          canvas: layer.canvas
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
