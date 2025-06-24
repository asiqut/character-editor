import * as PSD from 'ag-psd';

export async function loadPSD() {
  try {
    const response = await fetch(`${window.publicPath || ''}/assets/model_kinwoods.psd`);
    if (!response.ok) throw new Error(`Failed to fetch PSD: ${response.status}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const psd = PSD.readPsd(arrayBuffer, {
      parseLayerBlendingModes: true,
      preserveLayerPositions: true,
      skipLayerImageData: false
    });
    
    if (!psd || !psd.children) throw new Error('Invalid PSD structure');
    
    const processedData = {};
    
    // Соответствие между русскими именами групп и ключами частей
    const groupMapping = {
      'Уши': 'ears',
      'Глаза': 'eyes',
      'Щёки': 'cheeks',
      'Голова': 'head',
      'Грудь Шея Грива': 'mane',
      'Тело': 'body',
      'Хвосты': 'tail'
    };
    
    psd.children.forEach(group => {
      if (!group.name || !group.children) return;
      
      const partKey = groupMapping[group.name];
      if (!partKey) return;
      
      // Особый случай для головы (один вариант)
      if (partKey === 'head') {
        processedData[partKey] = group.children.map(layer => ({
          name: layer.name,
          canvas: layer.canvas,
          left: layer.left || 0,
          top: layer.top || 0,
          blendMode: layer.blendMode,
          clipping: layer.clipping,
          opacity: layer.opacity !== undefined ? layer.opacity : 1
        }));
        return;
      }
      
      // Обработка вариантных частей
      processedData[partKey] = {};
      
      group.children.forEach(variant => {
        if (!variant.name || !variant.children) return;
        
        processedData[partKey][variant.name] = variant.children.map(layer => ({
          name: layer.name,
          canvas: layer.canvas,
          left: layer.left || 0,
          top: layer.top || 0,
          blendMode: layer.blendMode,
          clipping: layer.clipping,
          opacity: layer.opacity !== undefined ? layer.opacity : 1
        }));
      });
    });
    
    return processedData;
  } catch (error) {
    console.error('Error loading PSD:', error);
    throw error;
  }
}
