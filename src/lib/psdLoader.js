// src/lib/psdLoader.js
import * as PSD from 'ag-psd';

const processLayer = (layer) => {
  if (!layer) return null;
  
  const processed = {
    name: layer.name,
    left: layer.left || 0,
    top: layer.top || 0,
    opacity: layer.opacity !== undefined ? layer.opacity : 1,
    blendMode: layer.blendMode || 'normal',
    clipping: layer.clipping || false,
    hidden: layer.hidden || false
  };

  // Создаем canvas для слоя
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
    processed.canvas = canvas;
  } else if (layer.canvas) {
    processed.canvas = layer.canvas;
  }

  return processed;
};

export async function loadPSD() {
  try {
    const response = await fetch(`${window.publicPath || ''}/assets/model_kinwoods.psd`);
    const arrayBuffer = await response.arrayBuffer();
    
    const psd = PSD.readPsd(arrayBuffer, {
      parseLayerBlendingModes: true,
      skipLayerImageData: false,
      useImageData: true,
      logMissingFeatures: true
    });

    const processGroup = (group) => {
      if (!group.children) return {};
      
      const variants = {};
      group.children.forEach(variant => {
        if (!variant.children) return;
        
        const layers = [];
        variant.children.forEach(layer => {
          // Обрабатываем обтравочные маски
          if (layer.clipping) {
            const clipped = processLayer(layer);
            if (clipped) {
              clipped.clipTo = layers[layers.length - 1]?.name;
              layers.push(clipped);
            }
          } else {
            const processed = processLayer(layer);
            if (processed) layers.push(processed);
          }
        });
        
        variants[variant.name] = { layers };
      });
      
      return variants;
    };

    const result = {};
    psd.children?.forEach(group => {
      result[group.name] = processGroup(group);
    });

    console.log('Full processed PSD:', result);
    return result;
  } catch (error) {
    console.error('PSD processing failed:', error);
    throw error;
  }
}
