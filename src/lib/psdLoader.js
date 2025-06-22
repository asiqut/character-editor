// src/lib/psdLoader.js
import * as PSD from 'ag-psd';

export async function loadPSD() {
  try {
    const response = await fetch(`${window.publicPath || ''}/assets/model_kinwoods.psd`);
    const arrayBuffer = await response.arrayBuffer();
    
    // Добавляем дополнительные опции для извлечения изображений
    const psd = PSD.readPsd(arrayBuffer, {
      parseLayerBlendingModes: true,
      skipLayerImageData: false, // ОБЯЗАТЕЛЬНО false
      useImageData: true, // Добавляем эту опцию
      logMissingFeatures: true // Для отладки
    });

    // Функция для извлечения canvas из слоя
    const extractCanvas = (layer) => {
      if (layer.canvas) return layer.canvas;
      
      if (layer.imageData && layer.width && layer.height) {
        const canvas = document.createElement('canvas');
        canvas.width = layer.width;
        canvas.height = layer.height;
        const ctx = canvas.getContext('2d');
        const imageData = new ImageData(
          new Uint8ClampedArray(layer.imageData),
          layer.width,
          layer.height
        );
        ctx.putImageData(imageData, 0, 0);
        return canvas;
      }
      
      return null;
    };

    // Обрабатываем структуру PSD
    const processGroup = (group) => {
      const result = {};
      group.children?.forEach(variant => {
        const layers = [];
        variant.children?.forEach(layer => {
          const canvas = extractCanvas(layer);
          if (canvas) {
            layers.push({
              name: layer.name,
              canvas: canvas,
              left: layer.left || 0,
              top: layer.top || 0,
              opacity: layer.opacity !== undefined ? layer.opacity : 1,
              blendMode: layer.blendMode || 'normal'
            });
          }
        });
        result[variant.name] = { layers };
      });
      return result;
    };

    const processed = {};
    psd.children?.forEach(group => {
      processed[group.name] = processGroup(group);
    });

    console.log('Processed PSD with canvases:', processed);
    return processed;
  } catch (error) {
    console.error('Full PSD loading error:', error);
    throw error;
  }
}
