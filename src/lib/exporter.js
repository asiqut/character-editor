// src/lib/exporter.js
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
        resolve();
      }, 100);
    } catch (error) {
      console.error('PNG export error:', error);
      resolve();
    }
  });
};

// PSD экспорт
export const exportPSD = async (psdData, character) => {
  try {
    // Создаем canvas с персонажем
    const characterCanvas = prepareCharacterCanvas(character, psdData);
    
    // Создаем базовую структуру PSD
    const newPsd = {
      width: 315,
      height: 315,
      children: []
    };

    // Добавляем слой с готовым изображением
    newPsd.children.push({
      name: 'Character',
      canvas: characterCanvas,
      left: 0,
      top: 0
    });

    // Конвертируем в PSD и скачиваем
    const psdBytes = PSD.writePsd(newPsd);
    const blob = new Blob([psdBytes], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `character_${Date.now()}.psd`;
    
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error('PSD export error:', error);
  }
};
