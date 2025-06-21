// src/lib/psdLoader.js
import * as PSD from 'ag-psd';

export async function loadPSD() {
  try {
    const response = await fetch(`${window.publicPath || ''}/assets/model_kinwoods.psd`);
    const arrayBuffer = await response.arrayBuffer();
    const psd = PSD.readPsd(arrayBuffer, {
      parseLayerBlendingModes: true,
      skipLayerImageData: false,
      useImageData: true
    });
    
    // Преобразуем структуру для удобного доступа
    const processed = {};
    psd.children?.forEach(group => {
      processed[group.name] = {};
      group.children?.forEach(variant => {
        processed[group.name][variant.name] = variant;
      });
    });
    
    return processed;
  } catch (error) {
    console.error('PSD loading failed:', error);
    throw error;
  }
}
