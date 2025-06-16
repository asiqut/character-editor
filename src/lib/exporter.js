import * as PSD from 'ag-psd';

// Общая функция для подготовки canvas
const prepareCharacterCanvas = (character, psdData) => {
  const canvas = document.createElement('canvas');
  canvas.width = 315;
  canvas.height = 315;
  const ctx = canvas.getContext('2d');

  const scale = 1.15;
  const offsetX = (315 - 315 * scale) / 2;
  const offsetY = (315 - 315 * scale) / 2;

  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);
  renderCharacter(canvas, psdData, character);
  ctx.restore();

  return canvas;
};

// PNG экспорт
export const exportPNG = (character, psdData) => {
  return new Promise((resolve) => {
    try {
      const canvas = prepareCharacterCanvas(character, psdData);
      const link = document.createElement('a');
      link.download = `character_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        resolve(true);
      }, 100);
    } catch (error) {
      console.error('PNG Export Error:', error);
      resolve(false);
    }
  });
};

// PSD экспорт
export const exportPSD = (psdData, character) => {
  return new Promise((resolve) => {
    try {
      const canvas = prepareCharacterCanvas(character, psdData);
      const psd = {
        width: 315,
        height: 315,
        children: [{
          name: 'Character',
          canvas: canvas
        }]
      };

      const bytes = PSD.writePsd(psd);
      const blob = new Blob([bytes], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `character_${Date.now()}.psd`;
      
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        resolve(true);
      }, 100);
    } catch (error) {
      console.error('PSD Export Error:', error);
      resolve(false);
    }
  });
};
