import * as PSD from 'ag-psd';

export async function loadPSD() {
  try {
    const response = await fetch(`${window.publicPath || ''}/assets/model_kinwoods.psd`);
    if (!response.ok) throw new Error(`Failed to fetch PSD: ${response.status}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const psd = PSD.readPsd(arrayBuffer, {
      // Включаем обработку режимов наложения
      parseLayerBlendingModes: true
    });
    
    if (!psd || !psd.children) throw new Error('Invalid PSD structure');
    
    // Нормализуем имена групп
    psd.children.forEach(group => {
      if (group.name) group.name = group.name.replace(/\\/g, '/');
      if (group.children) {
        group.children.forEach(subGroup => {
          if (subGroup.name) subGroup.name = subGroup.name.replace(/\\/g, '/');
          // Сохраняем режимы наложения
          if (subGroup.blendMode) {
            subGroup.blendMode = convertBlendMode(subGroup.blendMode);
          }
        });
      }
    });
    
    return psd;
  } catch (error) {
    console.error('Error loading PSD:', error);
    throw error;
  }
}

function convertBlendMode(psdBlendMode) {
  // Конвертируем PS blend modes в Canvas blend modes
  const modeMap = {
    'normal': 'source-over',
    'multiply': 'multiply',
    'screen': 'screen',
    'overlay': 'overlay',
  };
  return modeMap[psdBlendMode.toLowerCase()] || 'source-over';
}
