// src/lib/psdLoader.js
import * as PSD from 'ag-psd';

export async function loadPSD() {
  try {
    const response = await fetch(`${window.publicPath || ''}/assets/model_kinwoods.psd`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const psd = PSD.readPsd(arrayBuffer, {
      parseLayerBlendingModes: true,
      skipLayerImageData: false,
      useImageData: true,
      logMissingFeatures: true // Добавляем логирование
    });

    console.log('Raw PSD structure:', psd); // Логируем сырую структуру
    
    // Глубокая обработка структуры
    const processed = {};
    psd.children?.forEach(group => {
      if (!group.name || !group.children) return;
      
      processed[group.name] = {};
      group.children.forEach(variant => {
        if (!variant.name) return;
        
        // Сохраняем все свойства слоя
        processed[group.name][variant.name] = {
          ...variant,
          canvas: variant.canvas || null,
          left: variant.left || 0,
          top: variant.top || 0,
          opacity: variant.opacity !== undefined ? variant.opacity : 1,
          blendMode: variant.blendMode || 'normal'
        };
      });
    });

    console.log('Processed PSD structure:', processed);
    return processed;
  } catch (error) {
    console.error('Full PSD loading error:', error);
    throw error;
  }
}
